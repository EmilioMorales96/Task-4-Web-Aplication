const jwt = require('jsonwebtoken');
const db = require("../config/db");

// Verifica que el token sea válido y asigna los datos del usuario al request
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    const [user] = await db.query(
      'SELECT token_version FROM users WHERE id = ?',
      [decoded.id]
    );
    
    if (!user.length || user[0].token_version !== (decoded.tokenVersion || 0)) {
      return res.status(403).json({ message: "Token revoked" });
    }

    req.user = decoded;
    next();
  });
};

// Verifica si el usuario tiene rol "admin"
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

// Previene que un usuario actúe sobre sí mismo
const preventSelfAction = (req, res, next) => {
  // Asegurarse que req.user y req.params.id existen
  if (!req.user || !req.params.id) {
    return res.status(400).json({ message: "Missing user information" });
  }

  // Comparar IDs como strings para evitar problemas de tipo
  if (String(req.user.id) === String(req.params.id)) {
    return res.status(403).json({ 
      message: "Self-actions are not allowed for this operation",
    });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  roleCheck,
  preventSelfAction,
};
