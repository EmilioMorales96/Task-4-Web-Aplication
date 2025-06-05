
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');
const { blockIfUserBlocked } = require('../middleware/statusMiddleware');

// Get all users (requires authentication)
router.get('/', verifyToken, blockIfUserBlocked, async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT id, name, email, status, last_login FROM users ORDER BY last_login DESC'
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Block/unblock users
router.patch('/:id/status', verifyToken, blockIfUserBlocked, async (req, res) => {
  const userId = parseInt(req.params.id);

  // Prevent self-blocking
  if (req.user.id === userId) {
    return res.status(400).json({ message: "You cannot change your own status." });
  }
  try {
    await db.query(
      'UPDATE users SET status = IF(status = "active", "blocked", "active") WHERE id = ?',
      [userId]
    );
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status' });
  }
});
