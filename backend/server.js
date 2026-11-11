const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));

// Start Server & Test DB Connection
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL Database!');
    connection.release();

    app.listen(PORT, () => {
      console.log('🚀 Server running on http://localhost:' + PORT);
    });
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

startServer();