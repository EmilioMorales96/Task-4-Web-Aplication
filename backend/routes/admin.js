const express = require("express");
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Get all users 
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT id, name, email, role, status, last_login 
      FROM users 
      WHERE role = 'user' OR id = ?`, [req.user.id]);
    res.json({ users: results });
  } catch (err) {
    console.error("DB error:", err); 
    res.status(500).json({ message: "Database error" });
  }
});

// Block users 
router.post("/block", verifyToken, isAdmin, async (req, res) => {
  const ids = req.body.ids;
  
  if (!Array.isArray(ids)) {
    return res.status(400).json({ message: "Invalid user IDs" });
  }

  try {
    // Prevent blocking other admins
    await db.query(`
      UPDATE users 
      SET status = 'blocked' 
      WHERE id IN (?) 
      AND role = 'user'`, [ids]);
    
    res.json({ message: "Users blocked successfully" });
  } catch (err) {
    res.status(500).json({ message: "Blocking failed" });
  }
});

// Unblock users
router.post("/unblock", verifyToken, isAdmin, async (req, res) => {
  const ids = req.body.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Invalid user IDs." });
  }
  try {
    await db.query("UPDATE users SET blocked = 0 WHERE id IN (?)", [ids]);
    res.json({ message: "Users unblocked successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to unblock users." });
  }
});

// Delete users
router.post("/delete", verifyToken, isAdmin, async (req, res) => {
  const ids = req.body.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Invalid user IDs." });
  }
  try {
    await db.query("DELETE FROM users WHERE id IN (?)", [ids]);
    res.json({ message: "Users deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete users." });
  }
});

module.exports = router;
