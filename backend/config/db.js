const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,      
  user: process.env.DB_USER,      
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,    
  ssl: { rejectUnauthorized: false },
  connectTimeout: 10000,
  waitForConnections: true
});

// Prueba la conexión al iniciar 
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a MySQL');
    connection.release();
  } catch (err) {
    console.error('❌ Error al conectar a MySQL:', err.message);
  }
}

testConnection();
module.exports = pool;
