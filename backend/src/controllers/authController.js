export const login = (req, res) => {
  const { email, password } = req.body;

  // Simulación
  if (email === 'admin@test.com' && password === '1234') {
    return res.json({ message: 'Login correcto' });
  }

  res.status(401).json({ message: 'Credenciales incorrectas' });
};

export const register = (req, res) => {
  const { email, password } = req.body;

  // Simulación
  res.json({
    message: 'Usuario registrado',
    user: { email },
  });
};