// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Your MySQL connection

// Create Express app
const app = express();

// ✅ CORS configuration 
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://task-4-web-aplication-1.onrender.com"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200 // ✅ Fix for legacy browsers/Render preflight
}));

app.use(express.json());

// ✅ Test DB connection on startup
function testDbConnection() {
  db.query('SELECT 1', (err) => {
    if (err) {
      console.error('❌ DB connection failed:', err.message);
      process.exit(1);
    } else {
      console.log('✅ DB connection successful');
    }
  });
}

testDbConnection();

// ✅ Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

// Simple test route
app.get('/', (req, res) => res.send('API is running.'));

// DB health check endpoint
app.get('/test-db', (req, res) => {
  db.query('SELECT 1', (err) => {
    if (err) {
      res.status(500).send('❌ DB Error: ' + err.message);
    } else {
      res.send('✅ DB Funciona');
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
