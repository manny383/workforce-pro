import { pool } from '../config/db.js';

// 🔹 Registrar entrada
export const clockIn = async (req, res) => {
  try {
    const { user_id, locacion_id, latitud, longitud } = req.body;

    const [result] = await pool.query(
      `INSERT INTO asistencias (
         usuario_id,
         locacion_id,
         entrada,
         latitud_entrada,
         longitud_entrada
       )
       VALUES (?, ?, NOW(), ?, ?)`,
      [user_id, locacion_id || null, latitud || null, longitud || null]
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

// 🔹 Registrar salida
export const clockOut = async (req, res) => {
  try {
    const { user_id, latitud, longitud } = req.body;

    const [result] = await pool.query(
      `UPDATE asistencias
       SET salida = NOW(),
           latitud_salida = ?,
           longitud_salida = ?
       WHERE usuario_id = ? AND salida IS NULL
       ORDER BY entrada DESC
       LIMIT 1`,
      [latitud || null, longitud || null, user_id]
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

// 🔹 Obtener historial
export const getAttendance = async (req, res) => {
  try {
    const { user_id } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM asistencias WHERE usuario_id = ? ORDER BY entrada DESC`,
      [user_id]
    );

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener historial' });
  }
};
