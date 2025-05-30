const db = require('../config/db');
// Middleware to check if user is an admin
function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Forbidden: Admins only' });
}
// Middleware to block access if user is blocked
function blockIfUserBlocked(req, res, next) {
  const userId = req.user.id;
  const sql = 'SELECT status FROM users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error checking user status:', err);
      return res.status(500).json({ message: 'Server error.' });
    }
    if (results.length === 0 || results[0].status === 'blocked') {
      return res.status(403).json({ message: 'Access denied. User is blocked.' });
    }
    next();
  });
}

module.exports = { adminOnly, blockIfUserBlocked };
