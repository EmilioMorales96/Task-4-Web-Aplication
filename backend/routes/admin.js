const express = require("express");
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require("../middleware/authMiddleware");
const { blockIfUserBlocked } = require("../middleware/statusMiddleware");

// Middleware global para todas las rutas de este archivo
router.use(verifyToken);
router.use(blockIfUserBlocked);

// Función auxiliar para preparar placeholders y valores para el IN (?)
function formatIdsForQuery(ids) {
  const placeholders = ids.map(() => '?').join(',');
  return { placeholders, values: ids };
}

// Obtener todos los usuarios
router.get("/users", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT id, name, email, role, status, last_login 
      FROM users
    `);
    res.json(results);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// Bloquear usuarios
router.post("/block", async (req, res) => {
  const ids = req.body.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Invalid user IDs" });
  }
  try {
    const { placeholders, values } = formatIdsForQuery(ids);
    const sql = `UPDATE users SET status = 'blocked' WHERE id IN (${placeholders})`;
    await db.query(sql, values);
    res.json({ message: "Users blocked successfully" });
  } catch (err) {
    console.error("Blocking error:", err);
    res.status(500).json({ message: "Blocking failed" });
  }
});

// Desbloquear usuarios
router.post("/unblock", async (req, res) => {
  const ids = req.body.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Invalid user IDs" });
  }
  try {
    const { placeholders, values } = formatIdsForQuery(ids);
    const sql = `UPDATE users SET status = 'active' WHERE id IN (${placeholders})`;
    await db.query(sql, values);
    res.json({ message: "Users unblocked successfully" });
  } catch (err) {
    console.error("Unblocking error:", err);
    res.status(500).json({ message: "Failed to unblock users." });
  }
});

// Eliminar usuarios
router.post("/delete", async (req, res) => {
  const ids = req.body.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Invalid user IDs" });
  }
  try {
    const { placeholders, values } = formatIdsForQuery(ids);
    const sql = `DELETE FROM users WHERE id IN (${placeholders})`;
    await db.query(sql, values);
    res.json({ message: "Users deleted successfully." });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete users." });
  }
});

module.exports = router;
