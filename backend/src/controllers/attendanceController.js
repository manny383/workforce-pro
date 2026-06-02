import { pool } from '../config/db.js';
import { isManagerRole } from '../middleware/authMiddleware.js';

export const clockIn = async (req, res) => {
  try {
    const { locacion_id, latitud, longitud } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO asistencias (
         usuario_id,
         locacion_id,
         entrada,
         latitud_entrada,
         longitud_entrada
       )
       VALUES (?, ?, NOW(), ?, ?)`,
      [userId, locacion_id || null, latitud || null, longitud || null]
    );

    res.json({
      message: 'Entrada registrada',
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar entrada' });
  }
};

export const clockOut = async (req, res) => {
  try {
    const { latitud, longitud } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query(
      `UPDATE asistencias
       SET salida = NOW(),
           latitud_salida = ?,
           longitud_salida = ?
       WHERE usuario_id = ? AND salida IS NULL
       ORDER BY entrada DESC
       LIMIT 1`,
      [latitud || null, longitud || null, userId]
    );

    res.json({
      message: 'Salida registrada',
      updated: result.affectedRows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar salida' });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const requestedUserId = Number(req.params.user_id);

    if (!Number.isInteger(requestedUserId)) {
      return res.status(400).json({ message: 'Usuario invalido' });
    }

    if (requestedUserId !== req.user.id && !isManagerRole(req.user.rol)) {
      return res.status(403).json({ message: 'No tienes permisos para consultar este historial' });
    }

    const [rows] = await pool.query(
      `SELECT
         a.id,
         a.usuario_id,
         a.locacion_id,
         COALESCE(l.nombre, 'Sin ubicacion') AS locacion_nombre,
         a.entrada,
         a.salida,
         a.estatus,
         a.latitud_entrada,
         a.longitud_entrada,
         a.latitud_salida,
         a.longitud_salida,
         TIMESTAMPDIFF(MINUTE, a.entrada, COALESCE(a.salida, NOW())) AS duracion_minutos
       FROM asistencias a
       LEFT JOIN locaciones l ON l.id = a.locacion_id
       WHERE a.usuario_id = ?
       ORDER BY a.entrada DESC`,
      [requestedUserId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener historial' });
  }
};

export const getMyAttendance = async (req, res) => {
  req.params.user_id = String(req.user.id);
  return getAttendance(req, res);
};

export const getAttendanceStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT
         a.id,
         a.entrada,
         a.salida,
         a.estatus,
         COALESCE(l.nombre, 'Sin ubicacion') AS locacion_nombre,
         TIMESTAMPDIFF(MINUTE, a.entrada, COALESCE(a.salida, NOW())) AS duracion_minutos
       FROM asistencias a
       LEFT JOIN locaciones l ON l.id = a.locacion_id
       WHERE a.usuario_id = ?
       ORDER BY a.entrada DESC
       LIMIT 1`,
      [userId]
    );

    const latestAttendance = rows[0] || null;

    res.json({
      checkedIn: Boolean(latestAttendance && !latestAttendance.salida),
      latestAttendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener estado de asistencia' });
  }
};
