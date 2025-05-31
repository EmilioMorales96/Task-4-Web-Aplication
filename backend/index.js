const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Asegúrate de que exporte el pool

const app = express();

// ✅ CORS config (igual que antes)
app.use(cors({ ... }));

app.use(express.json());

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

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
app.get('/', (req, res) => res.send('API is running.'));
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1');
    res.send('✅ DB Connected');
  } catch (err) {
    res.status(500).send('❌ DB Connection Failed');
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
