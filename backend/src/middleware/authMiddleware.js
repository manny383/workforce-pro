import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    // 🔹 Obtener token del header
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    // Formato: Bearer TOKEN
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    // 🔹 Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔹 Guardar usuario en request
    req.user = decoded;

    next();

  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};