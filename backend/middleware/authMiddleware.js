const jwt = require('jsonwebtoken');

// Verifica que el token sea válido y asigna los datos del usuario al request
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Espera formato: Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    console.log("🛡️ JWT Decoded:", decoded); // Verifica qué hay dentro del token
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
