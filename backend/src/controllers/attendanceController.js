import { pool } from '../config/db.js';
import { isManagerRole } from '../middleware/authMiddleware.js';

const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const distanceInMeters = (latitudeA, longitudeA, latitudeB, longitudeB) => {
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const earthRadius = 6371000;
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(latitudeA)) * Math.cos(toRadians(latitudeB))
    * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const todayAssignmentsQuery = `
  SELECT
    a.id AS asignacion_id, a.locacion_id, a.turno_id,
    l.nombre AS locacion_nombre, l.descripcion AS locacion_descripcion,
    l.latitud, l.longitud, l.radio_permitido,
    t.nombre_turno, t.hora_entrada, t.hora_salida, t.tolerancia_minutos
  FROM asignaciones a
  INNER JOIN locaciones l ON l.id = a.locacion_id AND l.activa = TRUE
  INNER JOIN turnos t ON t.id = a.turno_id
  WHERE a.usuario_id = ?
    AND a.activa = TRUE
    AND CURDATE() BETWEEN a.fecha_inicio AND COALESCE(a.fecha_fin, '9999-12-31')
    AND JSON_CONTAINS(a.dias_semana, CAST(WEEKDAY(CURDATE()) + 1 AS JSON), '$')
`;

export const getTodayAssignments = async (req, res) => {
  try {
    const [assignments] = await pool.query(`${todayAssignmentsQuery} ORDER BY t.hora_entrada ASC`, [req.user.id]);
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al consultar los horarios de hoy' });
  }
};

export const clockIn = async (req, res) => {
  try {
    const locationId = Number(req.body.locacion_id);
    const latitude = toFiniteNumber(req.body.latitud);
    const longitude = toFiniteNumber(req.body.longitud);
    const userId = req.user.id;

    if (!Number.isInteger(locationId) || latitude === null || longitude === null) {
      return res.status(400).json({ message: 'Ubicacion y coordenadas validas son requeridas' });
    }

    const [openAttendances] = await pool.query(
      'SELECT id FROM asistencias WHERE usuario_id = ? AND salida IS NULL LIMIT 1',
      [userId]
    );
    if (openAttendances.length) {
      return res.status(409).json({ message: 'Ya tienes una entrada abierta. Registra tu salida primero.' });
    }

    const [assignments] = await pool.query(
      `${todayAssignmentsQuery} AND a.locacion_id = ? ORDER BY t.hora_entrada ASC LIMIT 1`,
      [userId, locationId]
    );
    const assignment = assignments[0];
    if (!assignment) {
      return res.status(403).json({ message: 'No tienes un horario vigente para esta ubicacion hoy' });
    }

    const distance = distanceInMeters(
      latitude,
      longitude,
      Number(assignment.latitud),
      Number(assignment.longitud)
    );
    if (distance > Number(assignment.radio_permitido)) {
      return res.status(403).json({
        message: `Estas fuera del area permitida por ${Math.ceil(distance - Number(assignment.radio_permitido))} metros`,
      });
    }

    const [statusRows] = await pool.query(
      `SELECT IF(CURTIME() > ADDTIME(?, SEC_TO_TIME(? * 60)), 'retardo', 'presente') AS estatus`,
      [assignment.hora_entrada, assignment.tolerancia_minutos]
    );
    const status = statusRows[0].estatus;

    const [result] = await pool.query(
      `INSERT INTO asistencias (
         usuario_id,
         locacion_id,
         asignacion_id,
         entrada,
         estatus,
         latitud_entrada,
         longitud_entrada,
         distancia_entrada
       )
       VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [userId, locationId, assignment.asignacion_id, status, latitude, longitude, distance]
    );

    res.json({
      message: status === 'retardo' ? 'Entrada registrada con retardo' : 'Entrada registrada',
      id: result.insertId,
      estatus: status,
      distancia_entrada: Math.round(distance),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar entrada' });
  }
};

export const clockOut = async (req, res) => {
  try {
    const latitude = toFiniteNumber(req.body.latitud);
    const longitude = toFiniteNumber(req.body.longitud);
    const userId = req.user.id;

    if (latitude === null || longitude === null) {
      return res.status(400).json({ message: 'Coordenadas validas son requeridas' });
    }

    const [openRows] = await pool.query(
      `SELECT a.id, l.latitud, l.longitud
       FROM asistencias a
       LEFT JOIN locaciones l ON l.id = a.locacion_id
       WHERE a.usuario_id = ? AND a.salida IS NULL
       ORDER BY a.entrada DESC LIMIT 1`,
      [userId]
    );
    const openAttendance = openRows[0];
    if (!openAttendance) {
      return res.status(409).json({ message: 'No tienes una entrada abierta' });
    }
    const distance = openAttendance.latitud === null
      ? null
      : distanceInMeters(latitude, longitude, Number(openAttendance.latitud), Number(openAttendance.longitud));

    const [result] = await pool.query(
      `UPDATE asistencias
       SET salida = NOW(),
           latitud_salida = ?,
           longitud_salida = ?,
           distancia_salida = ?
       WHERE id = ?`,
      [latitude, longitude, distance, openAttendance.id]
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
