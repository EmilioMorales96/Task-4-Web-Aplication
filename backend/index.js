const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

// ✅ Configuración CORS completa (usa tu versión original)
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
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Test DB connection on startup
async function testDbConnection() {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('✅ DB connection successful');
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }
}

testDbConnection();

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => res.send('API is running.'));

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1');
    res.send('✅ DB Connected');
  } catch (err) {
    res.status(500).send('❌ DB Connection Failed');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
