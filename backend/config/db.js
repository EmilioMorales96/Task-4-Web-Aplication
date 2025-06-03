const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }, 
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000
});

// Optional: test connection at startup
pool.getConnection()
  .then(conn => {
    console.log('✅ Connected to MySQL database (Promise pool)');
    conn.release();
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1); // Stop the server if DB is not reachable
  });

module.exports = pool;
