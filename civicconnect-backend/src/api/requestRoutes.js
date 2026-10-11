const express = require('express');
const router = express.Router();
const pool = require('../config/database');

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

        res.status(201).json({
            message: "Service request submitted successfully",
            request: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error during request creation." });
    }
});
router.get('/', async (req, res) => {
    const { status, categoryId } = req.query;
    
    try {
        let query = `SELECT * FROM service_requests`;
        const conditions = [];
        const values = [];

        if (status) {
            values.push(status);
            conditions.push(`status = $${values.length}`);
        }
        if (categoryId) {
            values.push(categoryId);
            conditions.push(`category_id = $${values.length}`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` ORDER BY created_at DESC;`;

        const result = await pool.query(query, values);
        res.status(200).json({ requests: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error while fetching queue." });
    }
});

module.exports = router;