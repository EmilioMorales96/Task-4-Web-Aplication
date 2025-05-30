const express = require("express");
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Get all users
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const [results] = await db.query("SELECT id, name, email, role, blocked, last_seen FROM users");
    res.json({ users: results });
  } catch (err) {
    console.error("DB error in /api/admin/users:", err); 
    res.status(500).json({ message: "DB error", error: err });
  }
});

// Block users
router.post("/block", verifyToken, isAdmin, async (req, res) => {
  const ids = req.body.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Invalid user IDs." });
  }
  try {
    await db.query("UPDATE users SET blocked = 1 WHERE id IN (?)", [ids]);
    res.json({ message: "Users blocked successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to block users." });
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
