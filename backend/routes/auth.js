const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, preventSelfAction } = require('../middleware/authMiddleware');
const { blockIfUserBlocked } = require('../middlewares/statusMiddleware');

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
router.post("/unblock/:id", verifyToken, blockIfUserBlocked, preventSelfAction, unblockUser);

// ELIMINAR USUARIO
router.delete('/delete/:id', verifyToken, preventSelfAction, authController.deleteUser);

module.exports = router;
