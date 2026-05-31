import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
  }

  return jwt.sign(
    {
      id: user.id,
      correo: user.correo,
      rol: user.rol,
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

export const login = async (req, res) => {
  try {
    const { email, correo, password } = req.body;
    const userEmail = correo || email;

    if (!userEmail || !password) {
      return res.status(400).json({ message: 'Correo y password son requeridos' });
    }

    const [rows] = await pool.query(
      `SELECT id, nombre, correo, password_hash, rol, activo
       FROM usuarios
       WHERE correo = ?
       LIMIT 1`,
      [userEmail]
    );

    const user = rows[0];

    if (!user || !user.activo) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = createToken(user);

    res.json({
      message: 'Login correcto',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesion' });
  }
};

export const register = async (req, res) => {
  try {
    const { nombre, email, correo, password, rol = 'empleado', telefono } = req.body;
    const userEmail = correo || email;

    if (!nombre || !userEmail || !password) {
      return res.status(400).json({ message: 'Nombre, correo y password son requeridos' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, correo, password_hash, rol, telefono)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, userEmail, passwordHash, rol, telefono || null]
    );

    res.status(201).json({
      message: 'Usuario registrado',
      user: {
        id: result.insertId,
        nombre,
        correo: userEmail,
        rol,
      },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El correo ya esta registrado' });
    }

    console.error(error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};
