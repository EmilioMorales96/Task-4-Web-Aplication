const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = decoded;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: "Admin privileges required" });
  }
  next();
};

const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

function preventSelfAction(req, res, next) {
  const currentUserId = parseInt(req.user.id);
  const targetUserId = parseInt(req.params.id);

  if (currentUserId === targetUserId) {
    return res.status(403).json({ message: 'You cannot perform this action on yourself.' });
  }

  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  roleCheck,
  preventSelfAction,
};
