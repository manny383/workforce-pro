import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

const roles = ['admin', 'supervisor', 'empleado'];

export const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, nombre, correo, rol, telefono, activo, fecha_creacion
       FROM usuarios
       ORDER BY activo DESC, nombre ASC`
    );

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al consultar usuarios' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { nombre, correo, password, telefono, rol = 'empleado' } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ message: 'Nombre, correo y password son requeridos' });
    }

    if (!roles.includes(rol)) {
      return res.status(400).json({ message: 'Rol invalido' });
    }

    if (req.user.rol !== 'admin' && rol !== 'empleado') {
      return res.status(403).json({ message: 'Solo un administrador puede asignar este rol' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, correo, password_hash, rol, telefono)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, correo, passwordHash, rol, telefono || null]
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      correo,
      rol,
      telefono: telefono || null,
      activo: 1,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El correo ya esta registrado' });
    }

    console.error(error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { activo } = req.body;

    if (!Number.isInteger(userId) || typeof activo !== 'boolean') {
      return res.status(400).json({ message: 'Datos invalidos' });
    }

    if (userId === req.user.id && !activo) {
      return res.status(400).json({ message: 'No puedes desactivar tu propia cuenta' });
    }

    const [rows] = await pool.query('SELECT rol FROM usuarios WHERE id = ? LIMIT 1', [userId]);
    const target = rows[0];

    if (!target) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (req.user.rol !== 'admin' && target.rol !== 'empleado') {
      return res.status(403).json({ message: 'Solo un administrador puede modificar esta cuenta' });
    }

    await pool.query('UPDATE usuarios SET activo = ? WHERE id = ?', [activo, userId]);
    res.json({ message: activo ? 'Usuario activado' : 'Usuario desactivado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};
