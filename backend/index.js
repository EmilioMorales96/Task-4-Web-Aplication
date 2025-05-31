// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Import custom modules
const db = require('./config/db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const adminRoutes = require("./routes/admin");

const app = express();

// Check required environment variables
if (!process.env.JWT_SECRET || !process.env.DB_HOST) {
  console.error('❌ Missing environment variables.');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/admin", adminRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is running.');
});

// Test DB connection route
app.get('/test-db', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.send('✅ DB Connected');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ DB Connection Failed');
  }
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});


