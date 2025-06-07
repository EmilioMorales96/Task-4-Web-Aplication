const jwt = require('jsonwebtoken');

// Verifica que el token JWT sea válido
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = decoded;
    next();
  });
};

// Verifica si el usuario tiene rol de administrador
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: "Admin privileges required" });
  }
  next();
};

// Verifica si el usuario tiene alguno de los roles permitidos
const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

// Previene que un usuario actúe sobre sí mismo (por ID)
const preventSelfAction = (req, res, next) => {
  console.log("🧩 preventSelfAction ejecutado");
  console.log("req.user:", req.user);
  console.log("req.params.id:", req.params.id);

  if (req.user && req.user.id == req.params.id) {
    return res.status(403).json({ message: "You cannot do this to yourself." });
  }
  next();
};

// Exporta todos los middlewares correctamente
module.exports = {
  verifyToken,
  isAdmin,
  roleCheck,
  preventSelfAction,
};


