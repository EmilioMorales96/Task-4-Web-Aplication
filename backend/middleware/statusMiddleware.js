const db = require('../config/db');
// Middleware to check if user is an admin
function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: Admins only' });
}

// Middleware to block access if user is blocked
async function blockIfUserBlocked(req, res, next) {
  try {
    const userId = req.user.id;

    const [results] = await db.query('SELECT status FROM users WHERE id = ?', [userId]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userStatus = results[0].status;

    if (userStatus === 'blocked') {
      return res.status(403).json({ message: 'Access denied. Your account is blocked.' });
    }

    next();
  } catch (err) {
    console.error('Error checking user status:', err);
    return res.status(500).json({ message: 'Server error while checking status.' });
  }
}

module.exports = { adminOnly, blockIfUserBlocked };
