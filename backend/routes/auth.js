const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, preventSelfAction } = require('../middleware/authMiddleware');

// REGISTER (lógica in-line porque está solo aquí)
router.post('/register', authController.register);

// LOGIN
router.post('/login', authController.login);

// VERIFY TOKEN
router.get('/verify', authController.verifyToken);

// BLOQUEAR USUARIO
router.post('/block/:id', verifyToken, preventSelfAction, authController.blockUser);

// DESBLOQUEAR USUARIO
router.post('/unblock/:id', verifyToken, preventSelfAction, authController.unblockUser);

// ELIMINAR USUARIO
router.delete('/delete/:id', verifyToken, preventSelfAction, authController.deleteUser);

module.exports = router;
