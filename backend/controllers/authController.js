router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // 1. Verificar intentos previos
    const [attempt] = await db.query(
      `SELECT * FROM login_attempts 
       WHERE email = ? AND blocked_until > NOW()`, 
      [email]
    );

    if (attempt) {
      return res.status(403).json({
        error: `Cuenta bloqueada temporalmente. Intenta después de ${new Date(attempt.blocked_until).toLocaleTimeString()}`
      });
    }

    // 2. Buscar usuario
    const [[user]] = await db.query(
  `SELECT * FROM users WHERE email = ?`, 
   [email]
   );

   if (!user) {
  return res.status(401).json({ error: "User not found" });
  }

   if (user.status !== 'active') {
  return res.status(403).json({ error: "Blocked acount or inactive" });
  }

    // 3. Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      // Registrar intento fallido
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

    // 4. Login exitoso - Resetear intentos
    await db.query(`DELETE FROM login_attempts WHERE email = ?`, [email]);

    // 5. Generar token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // 6. Actualizar último login
    await db.query(`UPDATE users SET last_login = NOW() WHERE id = ?`, [user.id]);

    // 7. Responder con datos seguros
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
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
