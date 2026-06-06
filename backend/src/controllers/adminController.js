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

export const getLocations = async (req, res) => {
  try {
    const [locations] = await pool.query(
      `SELECT id, nombre, descripcion, latitud, longitud, radio_permitido, activa, fecha_creacion
       FROM locaciones
       ORDER BY activa DESC, nombre ASC`
    );
    res.json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al consultar locaciones' });
  }
};

export const createLocation = async (req, res) => {
  try {
    const { nombre, descripcion, latitud, longitud, radio_permitido = 100 } = req.body;
    const latitude = Number(latitud);
    const longitude = Number(longitud);
    const radius = Number(radio_permitido);

    if (!nombre || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isInteger(radius)) {
      return res.status(400).json({ message: 'Nombre, coordenadas y radio valido son requeridos' });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 || radius < 1) {
      return res.status(400).json({ message: 'Las coordenadas o el radio estan fuera de rango' });
    }

    const [result] = await pool.query(
      `INSERT INTO locaciones (nombre, descripcion, latitud, longitud, radio_permitido)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, latitude, longitude, radius]
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      descripcion: descripcion || null,
      latitud: latitude,
      longitud: longitude,
      radio_permitido: radius,
      activa: 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear locacion' });
  }
};

export const updateLocationStatus = async (req, res) => {
  try {
    const locationId = Number(req.params.id);
    const { activa } = req.body;

    if (!Number.isInteger(locationId) || typeof activa !== 'boolean') {
      return res.status(400).json({ message: 'Datos invalidos' });
    }

    const [result] = await pool.query('UPDATE locaciones SET activa = ? WHERE id = ?', [activa, locationId]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Locacion no encontrada' });
    }

    res.json({ message: activa ? 'Locacion activada' : 'Locacion desactivada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar locacion' });
  }
};
