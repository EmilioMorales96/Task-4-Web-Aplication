router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // 1. Check previous login attempts and blocking
    const [[attempt]] = await db.query(
      `SELECT * FROM login_attempts 
       WHERE email = ? AND blocked_until > NOW()`, 
      [email]
    );

    if (attempt) {
      return res.status(403).json({
        error: `Account temporarily locked. Try again after ${new Date(attempt.blocked_until).toLocaleTimeString()}`
      });
    }

    // 2. Find user without filtering status yet
    const [[user]] = await db.query(
      `SELECT * FROM users WHERE email = ?`, 
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: "Account blocked or inactive" });
    }

    // 3. Check password validity with bcrypt.compare
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      // Register failed login attempt
      await db.query(
        `INSERT INTO login_attempts (email, attempts) 
         VALUES (?, 1) 
         ON DUPLICATE KEY UPDATE 
         attempts = attempts + 1, 
         last_attempt = NOW(),
         blocked_until = IF(attempts >= 3, DATE_ADD(NOW(), INTERVAL 15 MINUTE), NULL)`,
        [email]
      );
      
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 4. Successful login - reset attempts
    await db.query(`DELETE FROM login_attempts WHERE email = ?`, [email]);

    // 5. Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // 6. Update last login time
    await db.query(`UPDATE users SET last_login = NOW() WHERE id = ?`, [user.id]);

    // 7. Respond with user info and token
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
