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
    const { requesterId, categoryId, title, description } = req.body;
    if (!categoryId || !description || !title || !requesterId) {
        return res.status(400).json({ error: "requesterId, categoryId, title, and description are required." });
    }
    try {
        const query = `
            INSERT INTO service_requests (requester_id, category_id, title, description, status)
            VALUES ($1, $2, $3, $4, 'NEW')
            RETURNING request_id, status, title;
        `;
        const result = await pool.query(query, [requesterId, categoryId, title, description]);
        res.status(201).json({ message: "Service request submitted successfully", request: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Database error during request creation." });
    }
});

router.get('/', async (req, res) => {
    const { status, categoryId } = req.query;
    try {
        let query = `SELECT * FROM service_requests`;
        const conditions = [], values = [];

        if (status) { values.push(status); conditions.push(`status = $${values.length}`); }
        if (categoryId) { values.push(categoryId); conditions.push(`category_id = $${values.length}`); }
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
        console.error(err);
        res.status(500).json({ error: "Database error during status update." });
    } finally {
        client.release();
    }
});

router.post('/:id/assign', async (req, res) => {
    const { id } = req.params;
    const { assignedTo, assignedBy } = req.body;

    if (!assignedTo || !assignedBy) {
        return res.status(400).json({ error: "assignedTo and assignedBy user IDs are required." });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const requestCheck = await client.query(`SELECT status FROM service_requests WHERE request_id = $1`, [id]);
        if (requestCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Service request not found." });
        }

        await client.query(
            `INSERT INTO assignment_history (request_id, assigned_to, assigned_by) VALUES ($1, $2, $3)`,
            [id, assignedTo, assignedBy]
        );

        await client.query('COMMIT');
        res.status(200).json({ message: "Staff member assigned successfully." });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: "Database error during assignment." });
    } finally {
        client.release();
    }
});

module.exports = router;