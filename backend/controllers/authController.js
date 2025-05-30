const db = require('../config/db');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Registration validation middleware
exports.validateRegister = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password too short'),
  body('name').notEmpty().withMessage('Name is required')
];

// Registration handler
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO users (name, email, password, status, last_login) VALUES (?, ?, ?, ?, ?)';
  try {
    await db.query(sql, [name, email, hashedPassword, 'active', new Date()]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    return res.status(500).json({ message: 'Registration error', error: err });
  }
};

// Login handler
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'User is blocked' });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).json({ message: 'Invalid credentials' });

    // Update last_login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err });
  }
};