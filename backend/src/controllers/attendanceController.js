import { pool } from '../config/db.js';

// 🔹 Registrar entrada
export const clockIn = async (req, res) => {
  try {
    const { user_id } = req.body;

    const [result] = await pool.query(
      `INSERT INTO attendance (user_id, check_in)
       VALUES (?, NOW())`,
      [user_id]
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
    const { user_id } = req.body;

    const [result] = await pool.query(
      `UPDATE attendance 
       SET check_out = NOW()
       WHERE user_id = ? AND check_out IS NULL`,
      [user_id]
    );

    res.json({
      message: 'Salida registrada',
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
      `SELECT * FROM attendance WHERE user_id = ? ORDER BY check_in DESC`,
      [user_id]
    );

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener historial' });
  }
};