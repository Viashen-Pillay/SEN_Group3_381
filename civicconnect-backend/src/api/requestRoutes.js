const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const { categoryId, description } = req.body;
    
    if (!categoryId || !description) {
        return res.status(400).json({ error: "Category and description are required." });
    }
    
    res.status(201).json({
        message: "Service request submitted successfully",
        request: { id: 1, status: 'Pending', categoryId, description }
    });
});

module.exports = router;