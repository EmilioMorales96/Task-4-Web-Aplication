const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
};
exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      message: "Admin privileges required"
    });
  }
  next();
};

exports.roleCheck = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

exports.preventSelfAction = (req, res, next) => {
  const targetUserId = req.params.id; 
  const authUserId = req.user.id;

  if (targetUserId === String(authUserId)) {
    return res.status(400).json({ message: "You cannot perform this action on yourself." });
  }

  next();
};
