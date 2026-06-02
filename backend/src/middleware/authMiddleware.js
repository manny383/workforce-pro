import jwt from 'jsonwebtoken';

export const isManagerRole = (role) => role === 'admin' || role === 'supervisor';

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token invalido' });
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);

    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token invalido o expirado' });
  }
};

export const requireRoles = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({ message: 'No tienes permisos para realizar esta accion' });
  }

  next();
};
