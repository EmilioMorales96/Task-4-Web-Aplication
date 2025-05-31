const mysql = require('mysql2/promise'); // Usa la versión con Promesas

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,      // Ej: "containers-us-west-45.railway.app"
  user: process.env.DB_USER,      // Ej: "root"
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,      // Ej: 6874
  ssl: { rejectUnauthorized: false },
  connectTimeout: 10000,
  waitForConnections: true
});

// Prueba la conexión al iniciar (opcional)
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
