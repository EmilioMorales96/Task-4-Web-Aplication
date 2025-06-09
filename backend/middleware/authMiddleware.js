const jwt = require('jsonwebtoken');
const db = require("../config/db");

// Verifica que el token sea válido, usuario exista, no esté bloqueado y token_version coincida
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    try {
      const [user] = await db.query(
        'SELECT token_version, is_blocked, role FROM users WHERE id = ?',
        [decoded.id]
      );

      if (!user.length) {
        return res.status(403).json({ message: "User not found" });
      }

      if (user[0].token_version !== (decoded.tokenVersion || 0)) {
        return res.status(403).json({ message: "Token revoked" });
      }

      if (user[0].is_blocked) {
        return res.status(403).json({ message: "User is blocked" });
      }

      req.user = {
        ...decoded,
        role: user[0].role,
        is_blocked: user[0].is_blocked
      };

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
};

// Verifica si el usuario tiene rol "admin"
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: "Admin privileges required" });
  }
  next();
};

// Middleware genérico para verificar roles permitidos
const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};


module.exports = {
  verifyToken,
  isAdmin,
  roleCheck,
  preventSelfAction,
};
