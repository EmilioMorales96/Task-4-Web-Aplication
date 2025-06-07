const express = require("express");
const router = express.Router();
const db = require('../config/db');
const authController = require('../controllers/authController');
const { verifyToken, isAdmin, preventSelfAction } = require('../middleware/authMiddleware');
const { blockIfUserBlocked } = require('../middleware/statusMiddleware');

// REGISTER 
router.post('/register', authController.register);

// LOGIN
router.post('/login', authController.login);

// VERIFY TOKEN
router.get('/verify', verifyToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// BLOQUEAR USUARIO
router.post('/block/:id', verifyToken, preventSelfAction, authController.blockUser);

// DESBLOQUEAR USUARIO
router.post("/unblock/:id", verifyToken, blockIfUserBlocked, preventSelfAction, authController.unblockUser);

// ELIMINAR USUARIO
router.delete('/delete/:id', verifyToken, preventSelfAction, authController.deleteUser);


router.get('/me', verifyToken, async (req, res) => {
  try {
    const [user] = await db.query(
      "SELECT id, name, email, role, status FROM users WHERE id = ?", 
      [req.user.id] 
    );
    
    if (!user.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      role: user[0].role,
      status: user[0].status
    });
  } catch (err) {
    console.error("Error in /me endpoint:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
