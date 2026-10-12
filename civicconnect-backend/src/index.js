require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const requestRoutes = require('./api/requestRoutes');
const userRoutes = require('./api/userRoutes');
const categoryRoutes = require('./api/categoryRoutes');

app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);

if (require.main === module) {
    app.listen(PORT, ()=> {
        console.log(`CivicConnect backend running on port ${PORT}`);
    });
}

module.exports = app;