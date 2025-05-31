const mysql = require('mysql2/promise'); 

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,     
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,      
  ssl: { rejectUnauthorized: false }, 
  waitForConnections: true,
  connectTimeout: 10000, 
  connectionLimit: 10
});


pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado a MySQL en Railway!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err.message);
  });

module.exports = pool;
