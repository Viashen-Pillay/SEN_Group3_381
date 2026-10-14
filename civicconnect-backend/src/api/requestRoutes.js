const express = require('express');
const router = express.Router();
const pool = require('../config/database'); 
const WorkflowStateService = require('../services/WorkflowStateService');

const dbToServiceState = {
    'NEW': 'Pending',
    'IN_PROGRESS': 'In Progress',
    'RESOLVED': 'Resolved',
    'CLOSED': 'Closed'
};
const serviceToDbState = {
    'Pending': 'NEW',
    'In Progress': 'IN_PROGRESS',
    'Resolved': 'RESOLVED',
    'Closed': 'CLOSED'
};

router.post('/', async (req, res) => {
    const { requester_id, category_id, title, description } = req.body;
    if (!category_id || !description || !title || !requester_id) {
        return res.status(400).json({ error: "requester_id, category_id, title, and description are required." });
    }
    try {
        const query = `
            INSERT INTO service_requests (requester_id, category_id, title, description, status)
            VALUES ($1, $2, $3, $4, 'NEW')
            RETURNING request_id, status, title;
        `;
        const result = await pool.query(query, [requester_id, category_id, title, description]);
        res.status(201).json({ message: "Service request submitted successfully", request: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Database error during request creation." });
    }
});

router.get('/', async (req, res) => {
    const { status, category_id } = req.query;
    try {
        let query = `SELECT * FROM service_requests`;
        const conditions = [], values = [];

        if (status) { values.push(status); conditions.push(`status = $${values.length}`); }
        if (category_id) { values.push(category_id); conditions.push(`category_id = $${values.length}`); }
        if (conditions.length > 0) query += ` WHERE ` + conditions.join(' AND ');
        
        query += ` ORDER BY created_at DESC;`;
        const result = await pool.query(query, values);
        res.status(200).json({ requests: result.rows });
    } catch (err) {
        res.status(500).json({ error: "Database error while fetching queue." });
    }
});

router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { newStatus, changedBy } = req.body; 

    if (!newStatus || !changedBy) {
        return res.status(400).json({ error: "newStatus and changedBy are required." });
    }

    const targetDbStatus = serviceToDbState[newStatus];
    if (!targetDbStatus) {
        return res.status(400).json({ error: "Invalid status format provided." });
    }

    const client = await pool.connect(); 
    try {
        await client.query('BEGIN');

        const checkResult = await client.query(`SELECT status FROM service_requests WHERE request_id = $1 FOR UPDATE`, [id]);
        if (checkResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Service request not found." });
        }

        const currentDbStatus = checkResult.rows[0].status;
        const currentServiceStatus = dbToServiceState[currentDbStatus];

        if (!WorkflowStateService.isValidTransition(currentServiceStatus, newStatus)) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: `Invalid transition from ${currentServiceStatus} to ${newStatus}.` });
        }

        await client.query(
            `UPDATE service_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE request_id = $2`,
            [targetDbStatus, id]
        );

        await client.query(
            `INSERT INTO status_history (request_id, previous_status, new_status, changed_by) VALUES ($1, $2, $3, $4)`,
            [id, currentDbStatus, targetDbStatus, changedBy]
        );

        await client.query('COMMIT');
        res.status(200).json({ message: "Status updated successfully", status: newStatus });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: "Database error during status update." });
    } finally {
        client.release();
    }
});

router.post('/:id/assign', async (req, res) => {
    const requestId = Number(req.params.id);
    const assignedTo = Number(req.body.assignedTo);
    const assignedBy = Number(req.body.assignedBy);

    if (
        !Number.isSafeInteger(requestId) || requestId <= 0 ||
        !Number.isSafeInteger(assignedTo) || assignedTo <= 0 ||
        !Number.isSafeInteger(assignedBy) || assignedBy <= 0
    ) {
        return res.status(400).json({
            error: "Valid request, assignee and assigning user IDs are required."
        });
    }

    let client;

    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const requestResult = await client.query(`
            SELECT assigned_staff_id, status
            FROM service_requests
            WHERE request_id = $1
            FOR UPDATE
        `, [requestId]);

        if (requestResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                error: "Service request not found."
            });
        }

        const request = requestResult.rows[0];

        if (request.status === 'CLOSED') {
            await client.query('ROLLBACK');
            return res.status(400).json({
                error: "Closed requests cannot be reassigned."
            });
        }

        const usersResult = await client.query(`
            SELECT user_id, role, is_active
            FROM users
            WHERE user_id = ANY($1::integer[])
        `, [[assignedTo, assignedBy]]);

        const validStaffIds = new Set(
            usersResult.rows
                .filter(user =>
                    user.role === 'STAFF' && user.is_active
                )
                .map(user => user.user_id)
        );

        if (
            !validStaffIds.has(assignedTo) ||
            !validStaffIds.has(assignedBy)
        ) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                error: "Both users must be active staff members."
            });
        }

        const previousStaffId = request.assigned_staff_id;

        if (previousStaffId === assignedTo) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                error: "This staff member is already assigned."
            });
        }

        await client.query(`
            UPDATE service_requests
            SET assigned_staff_id = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE request_id = $2
        `, [assignedTo, requestId]);

        const historyResult = await client.query(`
            INSERT INTO assignment_history (
                request_id,
                previous_staff_id,
                new_staff_id,
                changed_by
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [
            requestId,
            previousStaffId,
            assignedTo,
            assignedBy
        ]);

        await client.query('COMMIT');

        res.status(200).json({
            message: "Staff member assigned successfully.",
            assigned_staff_id: assignedTo,
            assignment: historyResult.rows[0]
        });

    } catch (err) {
        if (client) await client.query('ROLLBACK');

        console.error("Assignment error:", err);

        res.status(500).json({
            error: "Database error during assignment."
        });
    } finally {
        if (client) client.release();
    }
});

router.post('/:id/comments', async (req, res) => {
    const requestId = Number(req.params.id);
    const authorId = Number(req.body.userId);
    const content = req.body.commentText;

    if (
        !Number.isSafeInteger(requestId) || requestId <= 0 ||
        !Number.isSafeInteger(authorId) || authorId <= 0 ||
        typeof content !== 'string' ||
        !content.trim()
    ) {
        return res.status(400).json({
            error: "Valid request ID, author ID and comment are required."
        });
    }

    try {
        const authorResult = await pool.query(`
            SELECT user_id
            FROM users
            WHERE user_id = $1
              AND role = 'STAFF'
              AND is_active = TRUE
        `, [authorId]);

        if (authorResult.rows.length === 0) {
            return res.status(403).json({
                error: "Only active staff members can add comments."
            });
        }

        const requestResult = await pool.query(`
            SELECT request_id
            FROM service_requests
            WHERE request_id = $1
        `, [requestId]);

        if (requestResult.rows.length === 0) {
            return res.status(404).json({
                error: "Service request not found."
            });
        }

        const result = await pool.query(`
            INSERT INTO request_comments (
                request_id,
                author_id,
                content
            )
            VALUES ($1, $2, $3)
            RETURNING
                comment_id,
                request_id,
                author_id,
                content,
                created_at
        `, [requestId, authorId, content.trim()]);

        res.status(201).json({
            message: "Comment added successfully.",
            comment: result.rows[0]
        });

    } catch (err) {
        console.error("Comment creation error:", err);

        res.status(500).json({
            error: "Unable to add comment."
        });
    }
});

router.get('/:id/comments', async (req, res) => {
    const requestId = Number(req.params.id);

    if (!Number.isSafeInteger(requestId) || requestId <= 0) {
        return res.status(400).json({
            error: "Invalid request ID."
        });
    }

    try {
        const result = await pool.query(`
            SELECT
                rc.comment_id,
                rc.request_id,
                rc.author_id,
                rc.content,
                rc.created_at,
                u.first_name,
                u.last_name

            FROM request_comments rc

            JOIN users u
                ON rc.author_id = u.user_id

            WHERE rc.request_id = $1

            ORDER BY
                rc.created_at ASC,
                rc.comment_id ASC
        `, [requestId]);

        res.status(200).json({
            comments: result.rows
        });

    } catch (err) {
        console.error("Comment retrieval error:", err);

        res.status(500).json({
            error: "Unable to fetch comments."
        });
    }
});

router.get('/:id/assignments', async (req, res) => {
    const requestId = Number(req.params.id);

    if (!Number.isSafeInteger(requestId) || requestId <= 0) {
        return res.status(400).json({
            error: "Invalid request ID."
        });
    }

    try {
        const result = await pool.query(`
            SELECT
                ah.assignment_history_id,
                ah.request_id,
                ah.previous_staff_id,
                ah.new_staff_id,
                ah.changed_by,
                ah.changed_at,

                previous_user.first_name AS previous_first_name,
                previous_user.last_name AS previous_last_name,

                new_user.first_name AS new_first_name,
                new_user.last_name AS new_last_name,

                changing_user.first_name AS changed_by_first_name,
                changing_user.last_name AS changed_by_last_name

            FROM assignment_history ah

            LEFT JOIN users previous_user
                ON ah.previous_staff_id = previous_user.user_id

            JOIN users new_user
                ON ah.new_staff_id = new_user.user_id

            JOIN users changing_user
                ON ah.changed_by = changing_user.user_id

            WHERE ah.request_id = $1

            ORDER BY
                ah.changed_at DESC,
                ah.assignment_history_id DESC
        `, [requestId]);

        res.status(200).json({
            assignments: result.rows
        });

    } catch (err) {
        console.error("Assignment history error:", err);

        res.status(500).json({
            error: "Unable to fetch assignment history."
        });
    }
});

module.exports = router;