const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
    try {
        const query = `SELECT * FROM categories ORDER BY category_id ASC;`;
        const result = await pool.query(query);
        
        res.status(200).json({ categories: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error while fetching categories." });
    }
});

module.exports = router;