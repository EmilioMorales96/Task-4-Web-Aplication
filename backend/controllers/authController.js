// POST /register 
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validación 
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?", 
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email.endsWith('@admin.com') ? 'admin' : 'user'; // Auto-rol
    
    await db.query(
      `INSERT INTO users 
      (name, email, password, status, role) 
      VALUES (?, ?, ?, 'active', ?)`,
      [name, email, hashedPassword, role]
    );
    
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /login (mejorado)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Verificación de intentos
    const [attemptRows] = await db.query(
      "SELECT * FROM login_attempts WHERE email = ?",
      [email]
    );
    
    const attempt = attemptRows[0];
    if (attempt?.blocked_until > new Date()) {
      return res.status(403).json({
        error: "Account temporarily locked"
      });
    }

    // Buscar usuario
    const [userRows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    
    const user = userRows[0];
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Validar contraseña
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // Lógica de intentos fallidos...
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Resetear intentos
    await db.query("DELETE FROM login_attempts WHERE email = ?", [email]);

    // Generar token con rol
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role  // Incluir rol
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    // Actualizar último login
    await db.query(
      "UPDATE users SET last_login = NOW() WHERE id = ?",
      [user.id]
    );
    
    res.json({ 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});
