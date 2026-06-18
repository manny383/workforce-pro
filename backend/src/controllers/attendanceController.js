import { pool } from '../config/db.js';
import { isManagerRole } from '../middleware/authMiddleware.js';

const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const GPS_FALLBACK_TOLERANCE_METERS = 25;
const GPS_MAX_TOLERANCE_METERS = 100;

const getGpsTolerance = (accuracy) => {
  if (accuracy === null) return GPS_FALLBACK_TOLERANCE_METERS;
  return Math.min(Math.max(Math.ceil(accuracy), GPS_FALLBACK_TOLERANCE_METERS), GPS_MAX_TOLERANCE_METERS);
};

const getBiometricVerification = (value) => {
  if (!value || value.verificada !== true || value.metodo !== 'platform') return null;
  if (typeof value.credential_id !== 'string' || value.credential_id.length < 16) return null;
  if (typeof value.tipo !== 'string' || value.tipo !== 'public-key') return null;

  const verifiedAt = new Date(value.timestamp);
  if (Number.isNaN(verifiedAt.getTime())) return null;

  return {
    method: value.metodo,
    credentialId: value.credential_id.slice(0, 255),
    verifiedAt,
  };
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

export const getClockInLocations = async (req, res) => {
  try {
    const [locations] = await pool.query(
      `SELECT id, nombre, descripcion, latitud, longitud, radio_permitido
       FROM locaciones
       WHERE activa = TRUE
       ORDER BY nombre ASC`
    );
    res.json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al consultar ubicaciones disponibles' });
  }
};

export const clockIn = async (req, res) => {
  try {
    const locationId = Number(req.body.locacion_id);
    const latitude = toFiniteNumber(req.body.latitud);
    const longitude = toFiniteNumber(req.body.longitud);
    const accuracy = toFiniteNumber(req.body.precision);
    const biometricVerification = getBiometricVerification(req.body.biometria);
    const userId = req.user.id;

    if (!Number.isInteger(locationId) || latitude === null || longitude === null) {
      return res.status(400).json({ message: 'Ubicacion y coordenadas validas son requeridas' });
    }

    if (!biometricVerification) {
      return res.status(403).json({ message: 'Verificacion biometrica requerida antes de registrar asistencia' });
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
    const [locationRows] = assignment
      ? [[assignment]]
      : await pool.query(
        `SELECT id AS locacion_id, nombre AS locacion_nombre, latitud, longitud, radio_permitido
         FROM locaciones
         WHERE id = ? AND activa = TRUE
         LIMIT 1`,
        [locationId]
      );
    const location = locationRows[0];
    if (!location) {
      return res.status(403).json({ message: 'La ubicacion seleccionada no esta disponible' });
    }

    const distance = distanceInMeters(
      latitude,
      longitude,
      Number(location.latitud),
      Number(location.longitud)
    );
    const allowedRadius = Number(location.radio_permitido);
    const gpsTolerance = getGpsTolerance(accuracy);
    const effectiveRadius = allowedRadius + gpsTolerance;
    if (distance > effectiveRadius) {
      return res.status(403).json({
        message: `Estas fuera del area permitida por ${Math.ceil(distance - effectiveRadius)} metros. Distancia detectada: ${Math.round(distance)} m; radio autorizado: ${allowedRadius} m + margen GPS: ${gpsTolerance} m.`,
      });
    }

    let status = 'presente';
    const origin = assignment ? 'horario' : 'manual';
    if (assignment) {
      const [statusRows] = await pool.query(
        `SELECT IF(CURTIME() > ADDTIME(?, SEC_TO_TIME(? * 60)), 'retardo', 'presente') AS estatus`,
        [assignment.hora_entrada, assignment.tolerancia_minutos]
      );
      status = statusRows[0].estatus;
    }

    const [result] = await pool.query(
      `INSERT INTO asistencias (
         usuario_id,
         locacion_id,
         asignacion_id,
         entrada,
         estatus,
         origen,
         biometria_verificada,
         metodo_biometrico,
         biometria_credential_id,
         biometria_verificada_en,
         latitud_entrada,
         longitud_entrada,
         precision_entrada,
         distancia_entrada
       )
       VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        locationId,
        assignment?.asignacion_id ?? null,
        status,
        origin,
        true,
        biometricVerification.method,
        biometricVerification.credentialId,
        biometricVerification.verifiedAt,
        latitude,
        longitude,
        accuracy,
        distance,
      ]
    );

    res.json({
      message: status === 'retardo' ? 'Entrada registrada con retardo' : 'Entrada registrada',
      id: result.insertId,
      estatus: status,
      origen: origin,
      biometria_verificada: true,
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
         COALESCE(a.origen, IF(a.asignacion_id IS NULL, 'manual', 'horario')) AS origen,
         a.biometria_verificada,
         a.metodo_biometrico,
         a.biometria_verificada_en,
         a.latitud_entrada,
         a.longitud_entrada,
         a.precision_entrada,
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
         COALESCE(a.origen, IF(a.asignacion_id IS NULL, 'manual', 'horario')) AS origen,
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

export const getEmployeeDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const [statusRows] = await pool.query(
      `SELECT a.id, a.entrada, a.salida, a.estatus,
              COALESCE(a.origen, IF(a.asignacion_id IS NULL, 'manual', 'horario')) AS origen,
              l.nombre AS locacion_nombre,
              TIMESTAMPDIFF(MINUTE, a.entrada, COALESCE(a.salida, NOW())) AS duracion_minutos
       FROM asistencias a LEFT JOIN locaciones l ON l.id = a.locacion_id
       WHERE a.usuario_id = ? ORDER BY a.entrada DESC LIMIT 1`,
      [userId]
    );
    const [todayRows] = await pool.query(
      `SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, entrada, COALESCE(salida, NOW()))), 0) AS minutos
       FROM asistencias WHERE usuario_id = ? AND DATE(entrada) = CURDATE()`,
      [userId]
    );
    const [recent] = await pool.query(
      `SELECT a.id, a.entrada, a.salida, a.estatus,
              COALESCE(a.origen, IF(a.asignacion_id IS NULL, 'manual', 'horario')) AS origen,
              COALESCE(l.nombre, 'Sin ubicacion') AS locacion_nombre,
              TIMESTAMPDIFF(MINUTE, a.entrada, COALESCE(a.salida, NOW())) AS duracion_minutos
       FROM asistencias a LEFT JOIN locaciones l ON l.id = a.locacion_id
       WHERE a.usuario_id = ? ORDER BY a.entrada DESC LIMIT 3`,
      [userId]
    );
    let assignments = [];
    try {
      [assignments] = await pool.query(`${todayAssignmentsQuery} ORDER BY t.hora_entrada ASC`, [userId]);
    } catch (assignmentError) {
      console.error('No se pudieron cargar asignaciones del dashboard:', assignmentError);
    }
    const latestAttendance = statusRows[0] || null;

    res.json({
      checkedIn: Boolean(latestAttendance && !latestAttendance.salida),
      latestAttendance,
      todayMinutes: Number(todayRows[0].minutos),
      assignments,
      recent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: process.env.NODE_ENV === 'production'
        ? 'Error al cargar el dashboard'
        : `Error al cargar el dashboard: ${error.message}`,
    });
  }
};
