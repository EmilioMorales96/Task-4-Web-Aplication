require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

// CORS middleware
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
  optionsSuccessStatus: 200
}));

// Parse JSON bodies
app.use(express.json());

// Rutas
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));


app.get('/', (req, res) => res.send('API is running.'));

// Test DB connection al inicio 
async function testDbConnection() {
  try {
    await db.query('SELECT 1');
    console.log('✅ DB connection successful');
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }
}
testDbConnection();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

