const bcrypt = require("bcryptjs");
const db = require("../config/db");
const jwt = require("jsonwebtoken");

// Register user 
async function register(req, res) {
  try {
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

   
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (name, email, password, status, role) VALUES (?, ?, ?, 'active', ?)`,
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ message: "User registered" });
  } catch (error) {
    console.error("🔥 Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
}

// Login user
async function login(req, res) {
  const { email, password } = req.body;
  try {
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

    const [userRows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = userRows[0];

    const isValid = user && (await bcrypt.compare(password, user.password));
    if (!isValid) {
      if (!attempt) {
        await db.query(
          "INSERT INTO login_attempts (email, attempts, last_attempt) VALUES (?, ?, ?)",
          [email, 1, now]
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

    // Login exitoso, borrar intentos previos
    await db.query("DELETE FROM login_attempts WHERE email = ?", [email]);

    if (user.status === "blocked") {
      return res.status(403).json({ error: "User is blocked" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, tokenVersion: user.token_version || 0 },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    console.error("🔥 Internal error in /login:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

// Block user 
async function blockUser(req, res) {
  try {
    // Validar que el que bloquea sea admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const targetUserId = parseInt(req.params.id);

    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: "You can't block yourself" });
    }

    const [result] = await db.query(
      'UPDATE users SET status = "blocked", token_version = COALESCE(token_version, 0) + 1 WHERE id = ?',
      [targetUserId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User blocked successfully" });
  } catch (err) {
    console.error("Error blocking user:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// Unblock user 
async function unblockUser(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const targetUserId = parseInt(req.params.id);

    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: "You can't unblock yourself" });
    }

    const [result] = await db.query(
      'UPDATE users SET status = "active" WHERE id = ?',
      [targetUserId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User unblocked successfully" });
  } catch (err) {
    console.error("Error unblocking user:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// Delete user 
async function deleteUser(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const targetUserId = parseInt(req.params.id);

    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: "You can't delete yourself" });
    }

    const [result] = await db.query("DELETE FROM users WHERE id = ?", [
      targetUserId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  register,
  login,
  blockUser,
  unblockUser,
  deleteUser,
};
