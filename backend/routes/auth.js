const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require('../config/db'); 
const jwt = require("jsonwebtoken");


// POST /register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (name, email, password, status, last_login) VALUES (?, ?, ?, ?, ?)';
    const values = [name, email, hashedPassword, 'active', new Date()];
    await db.query(sql, values);
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Step 1: Veriry if the user is registred and not blocked
    const [attemptRows] = await db.query(
      "SELECT * FROM login_attempts WHERE email = ?",
      [email]
    );
    const attempt = attemptRows[0];
    const now = new Date();
    if (attempt && attempt.blocked_until && new Date(attempt.blocked_until) > now) {
      return res.status(403).json({
        error: "Too many failed attempts. Try again later.",
      });
    }
    // Step 2: Search user
    const [userRows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const user = userRows[0];
    // Step 3: Validate password
    const isValid = user && (await bcrypt.compare(password, user.password));
    if (!isValid) {
      // Falló login: actualizar intentos
      if (!attempt) {
        await db.query(
          "INSERT INTO login_attempts (email, attempts) VALUES (?, ?)",
          [email, 1]
        );
      } else {
        const newAttempts = attempt.attempts + 1;
        const blockedUntil =
          newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
        await db.query(
          "UPDATE login_attempts SET attempts = ?, last_attempt = ?, blocked_until = ? WHERE email = ?",
          [newAttempts, now, blockedUntil, email]
        );
      }
      return res.status(401).json({ error: "Invalid credentials." });
    }
    // Step 4: Login successful: reset attempts
    await db.query("DELETE FROM login_attempts WHERE email = ?", [
      email,
    ]);
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, // <-- role must be "admin" for admins
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    console.error("🔥 Internal error in /login:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/auth/verify
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token required" });
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    res.json({ user });
  });
});

module.exports = router;
