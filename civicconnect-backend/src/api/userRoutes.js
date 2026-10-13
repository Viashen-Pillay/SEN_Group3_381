const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs'); 

router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const userRole = role || 'Requester';

    try {
        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = `
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING user_id, name, email, role;
        `;
        
        const result = await pool.query(query, [name, email, hashedPassword, userRole]);

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: "Email already exists." });
        }
        res.status(500).json({ error: "Database error during registration." });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        const query = `SELECT * FROM users WHERE email = $1`;
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const isValidPassword = await bcrypt.compare(password, result.rows[0].password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                user_id: result.rows[0].user_id,
                name: result.rows[0].name,
                role: result.rows[0].role
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Database error during login." });
    }
});

module.exports = router;