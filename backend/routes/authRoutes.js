const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
// Middleware to handle authentication and authorization
router.post('/register', register);
router.post('/login', login);

module.exports = router;
