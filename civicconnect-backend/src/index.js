require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = proccess.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const requestRoutes = require('./api/requestRoutes');

app.use('/api/v1/requests', requestRoutes);

app.listen(PORT, ()=> {
    console.log(`CivicConnect backend running on port ${PORT}`)
})