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
const allowedOrigins = [
  "http://localhost:5173",
  "https://task-4-web-aplication-1.onrender.com"
];

const app = express();
app.use(cors({ ... })); 
app.use(express.json());
app.use("/api", routes); 


// Check required environment variables
if (!process.env.JWT_SECRET || !process.env.DB_HOST) {
  console.error('❌ Missing environment variables.');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://task-4-web-aplication-1.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
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
app.listen(process.env.PORT || 5000, () => {
  console.log("Server is running");
});

