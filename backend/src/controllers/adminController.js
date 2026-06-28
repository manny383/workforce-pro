import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

const roles = ['admin', 'supervisor', 'empleado'];

export const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT
         u.id, u.nombre, u.correo, u.rol, u.telefono, u.activo, u.fecha_creacion,
         today_assignment.id AS asignacion_hoy_id,
         today_location.nombre AS ubicacion_hoy,
         today_shift.nombre_turno AS turno_hoy,
         today_shift.hora_entrada AS hora_entrada_hoy,
         today_shift.hora_salida AS hora_salida_hoy,
         today_attendance.id AS asistencia_hoy_id,
         today_attendance.entrada AS entrada_hoy,
         today_attendance.salida AS salida_hoy,
         today_attendance.estatus AS estatus_hoy,
         last_attendance.entrada AS ultima_entrada,
         last_attendance.salida AS ultima_salida,
         last_location.nombre AS ultima_ubicacion
       FROM usuarios u
       LEFT JOIN asignaciones today_assignment
         ON today_assignment.id = (
           SELECT a.id
           FROM asignaciones a
           WHERE a.usuario_id = u.id
             AND a.activa = TRUE
             AND CURDATE() BETWEEN a.fecha_inicio AND COALESCE(a.fecha_fin, '9999-12-31')
             AND JSON_CONTAINS(a.dias_semana, CAST(WEEKDAY(CURDATE()) + 1 AS JSON), '$')
           ORDER BY a.fecha_inicio DESC, a.id DESC
           LIMIT 1
         )
       LEFT JOIN locaciones today_location ON today_location.id = today_assignment.locacion_id
       LEFT JOIN turnos today_shift ON today_shift.id = today_assignment.turno_id
       LEFT JOIN asistencias today_attendance
         ON today_attendance.id = (
           SELECT att.id
           FROM asistencias att
           WHERE att.usuario_id = u.id
             AND DATE(att.entrada) = CURDATE()
           ORDER BY att.entrada DESC, att.id DESC
           LIMIT 1
         )
       LEFT JOIN asistencias last_attendance
         ON last_attendance.id = (
           SELECT att.id
           FROM asistencias att
           WHERE att.usuario_id = u.id
           ORDER BY att.entrada DESC, att.id DESC
           LIMIT 1
         )
       LEFT JOIN locaciones last_location ON last_location.id = last_attendance.locacion_id
       ORDER BY u.activo DESC, u.nombre ASC`
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

export const updateUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { nombre, correo, telefono, rol, password = '' } = req.body;

    if (!Number.isInteger(userId)) {
      return res.status(400).json({ message: 'Usuario invalido' });
    }

    if (!nombre || !correo) {
      return res.status(400).json({ message: 'Nombre y correo son requeridos' });
    }

    if (password && password.length < 8) {
      return res.status(400).json({ message: 'El password debe tener al menos 8 caracteres' });
    }

    const [rows] = await pool.query('SELECT id, rol, activo FROM usuarios WHERE id = ? LIMIT 1', [userId]);
    const target = rows[0];

    if (!target) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const nextRole = rol || target.rol;
    if (!roles.includes(nextRole)) {
      return res.status(400).json({ message: 'Rol invalido' });
    }

    if (req.user.rol !== 'admin' && (target.rol !== 'empleado' || nextRole !== 'empleado')) {
      return res.status(403).json({ message: 'Solo un administrador puede modificar esta cuenta' });
    }

    if (req.user.rol !== 'admin' && nextRole !== 'empleado') {
      return res.status(403).json({ message: 'Solo un administrador puede asignar este rol' });
    }

    if (userId === req.user.id && nextRole !== req.user.rol) {
      return res.status(400).json({ message: 'No puedes cambiar tu propio rol' });
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE usuarios
         SET nombre = ?, correo = ?, telefono = ?, rol = ?, password_hash = ?
         WHERE id = ?`,
        [nombre, correo, telefono || null, nextRole, passwordHash, userId]
      );
    } else {
      await pool.query(
        `UPDATE usuarios
         SET nombre = ?, correo = ?, telefono = ?, rol = ?
         WHERE id = ?`,
        [nombre, correo, telefono || null, nextRole, userId]
      );
    }

    res.json({
      id: userId,
      nombre,
      correo,
      rol: nextRole,
      telefono: telefono || null,
      activo: target.activo,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El correo ya esta registrado' });
    }

    console.error(error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
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

export const getShifts = async (req, res) => {
  try {
    const [shifts] = await pool.query(
      `SELECT id, nombre_turno, hora_entrada, hora_salida, tolerancia_minutos
       FROM turnos
       ORDER BY hora_entrada ASC`
    );
    res.json(shifts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al consultar turnos' });
  }
};

export const createShift = async (req, res) => {
  try {
    const { nombre_turno, hora_entrada, hora_salida, tolerancia_minutos = 10 } = req.body;
    const tolerance = Number(tolerancia_minutos);
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!nombre_turno || !timePattern.test(hora_entrada || '') || !timePattern.test(hora_salida || '')
      || !Number.isInteger(tolerance) || tolerance < 0) {
      return res.status(400).json({ message: 'Nombre, horarios y tolerancia valida son requeridos' });
    }

    const [result] = await pool.query(
      `INSERT INTO turnos (nombre_turno, hora_entrada, hora_salida, tolerancia_minutos)
       VALUES (?, ?, ?, ?)`,
      [nombre_turno, hora_entrada, hora_salida, tolerance]
    );

    res.status(201).json({
      id: result.insertId,
      nombre_turno,
      hora_entrada,
      hora_salida,
      tolerancia_minutos: tolerance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear turno' });
  }
};

export const updateShift = async (req, res) => {
  try {
    const shiftId = Number(req.params.id);
    const { nombre_turno, hora_entrada, hora_salida, tolerancia_minutos = 10 } = req.body;
    const tolerance = Number(tolerancia_minutos);
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!Number.isInteger(shiftId) || !nombre_turno || !timePattern.test(hora_entrada || '')
      || !timePattern.test(hora_salida || '') || !Number.isInteger(tolerance) || tolerance < 0) {
      return res.status(400).json({ message: 'Datos de turno invalidos' });
    }

    const [result] = await pool.query(
      `UPDATE turnos
       SET nombre_turno = ?, hora_entrada = ?, hora_salida = ?, tolerancia_minutos = ?
       WHERE id = ?`,
      [nombre_turno, hora_entrada, hora_salida, tolerance, shiftId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    res.json({
      id: shiftId,
      nombre_turno,
      hora_entrada,
      hora_salida,
      tolerancia_minutos: tolerance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar turno' });
  }
};

export const getUserAssignments = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ message: 'Usuario invalido' });
    }

    const [assignments] = await pool.query(
      `SELECT
         a.id, a.usuario_id, a.locacion_id, a.turno_id, a.fecha_inicio,
         a.fecha_fin, a.dias_semana, a.activa, a.fecha_creacion,
         l.nombre AS locacion_nombre,
         t.nombre_turno, t.hora_entrada, t.hora_salida, t.tolerancia_minutos
       FROM asignaciones a
       INNER JOIN locaciones l ON l.id = a.locacion_id
       INNER JOIN turnos t ON t.id = a.turno_id
       WHERE a.usuario_id = ?
       ORDER BY a.activa DESC, a.fecha_inicio DESC, t.hora_entrada ASC`,
      [userId]
    );

    res.json(assignments.map((assignment) => ({
      ...assignment,
      dias_semana: typeof assignment.dias_semana === 'string'
        ? JSON.parse(assignment.dias_semana)
        : assignment.dias_semana,
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al consultar horarios' });
  }
};

export const createUserAssignment = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const locationId = Number(req.body.locacion_id);
    const shiftId = Number(req.body.turno_id);
    const { fecha_inicio, fecha_fin = null, dias_semana } = req.body;

    const validDays = Array.isArray(dias_semana)
      && dias_semana.length > 0
      && dias_semana.every((day) => Number.isInteger(day) && day >= 1 && day <= 7);

    if (!Number.isInteger(userId) || !Number.isInteger(locationId) || !Number.isInteger(shiftId)
      || !fecha_inicio || !validDays) {
      return res.status(400).json({ message: 'Usuario, ubicacion, turno, fecha y dias validos son requeridos' });
    }

    if (fecha_fin && fecha_fin < fecha_inicio) {
      return res.status(400).json({ message: 'La fecha final no puede ser anterior a la fecha inicial' });
    }

    const [references] = await pool.query(
      `SELECT
         EXISTS(SELECT 1 FROM usuarios WHERE id = ? AND activo = TRUE) AS usuario_valido,
         EXISTS(SELECT 1 FROM locaciones WHERE id = ? AND activa = TRUE) AS locacion_valida,
         EXISTS(SELECT 1 FROM turnos WHERE id = ?) AS turno_valido`,
      [userId, locationId, shiftId]
    );
    const reference = references[0];
    if (!reference.usuario_valido || !reference.locacion_valida || !reference.turno_valido) {
      return res.status(400).json({ message: 'El usuario, la ubicacion o el turno no estan disponibles' });
    }

    const normalizedDays = [...new Set(dias_semana)].sort((a, b) => a - b);
    const [result] = await pool.query(
      `INSERT INTO asignaciones
         (usuario_id, locacion_id, turno_id, fecha_inicio, fecha_fin, dias_semana)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, locationId, shiftId, fecha_inicio, fecha_fin || null, JSON.stringify(normalizedDays)]
    );

    res.status(201).json({ id: result.insertId, message: 'Horario asignado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al asignar horario' });
  }
};

export const updateAssignmentStatus = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    const { activa } = req.body;
    if (!Number.isInteger(assignmentId) || typeof activa !== 'boolean') {
      return res.status(400).json({ message: 'Datos invalidos' });
    }

    const [result] = await pool.query('UPDATE asignaciones SET activa = ? WHERE id = ?', [activa, assignmentId]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Horario no encontrado' });
    }
    res.json({ message: activa ? 'Horario activado' : 'Horario desactivado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar horario' });
  }
};

export const getManagerDashboard = async (req, res) => {
  try {
    const [summaryRows] = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM usuarios WHERE activo = TRUE AND rol = 'empleado') AS empleados,
         (SELECT COUNT(*) FROM locaciones WHERE activa = TRUE) AS locaciones,
         (SELECT COUNT(*) FROM asistencias WHERE salida IS NULL) AS activos,
         (SELECT COUNT(*) FROM asistencias WHERE DATE(entrada) = CURDATE() AND estatus = 'retardo') AS retardos,
         (SELECT COUNT(DISTINCT usuario_id) FROM asignaciones
          WHERE activa = TRUE AND CURDATE() BETWEEN fecha_inicio AND COALESCE(fecha_fin, '9999-12-31')
          AND JSON_CONTAINS(dias_semana, CAST(WEEKDAY(CURDATE()) + 1 AS JSON), '$')) AS programados,
         (SELECT COUNT(DISTINCT usuario_id) FROM asistencias WHERE DATE(entrada) = CURDATE()) AS presentes`
    );
    const [weekly] = await pool.query(
      `SELECT DATE(entrada) AS fecha, COUNT(DISTINCT usuario_id) AS presentes
       FROM asistencias WHERE entrada >= CURDATE() - INTERVAL 6 DAY
       GROUP BY DATE(entrada) ORDER BY fecha ASC`
    );
    const [alerts] = await pool.query(
      `SELECT u.nombre, l.nombre AS locacion_nombre, a.entrada,
              GREATEST(0, TIMESTAMPDIFF(
                MINUTE,
                TIMESTAMP(DATE(a.entrada), COALESCE((
                  SELECT t.hora_entrada
                  FROM asignaciones ag
                  INNER JOIN turnos t ON t.id = ag.turno_id
                  WHERE ag.usuario_id = a.usuario_id
                    AND ag.locacion_id = a.locacion_id
                    AND ag.activa = TRUE
                    AND DATE(a.entrada) BETWEEN ag.fecha_inicio AND COALESCE(ag.fecha_fin, '9999-12-31')
                  ORDER BY ag.fecha_inicio DESC
                  LIMIT 1
                ), TIME(a.entrada))),
                a.entrada
              )) AS minutos_retardo
       FROM asistencias a
       INNER JOIN usuarios u ON u.id = a.usuario_id
       LEFT JOIN locaciones l ON l.id = a.locacion_id
       WHERE DATE(a.entrada) = CURDATE() AND a.estatus = 'retardo'
       ORDER BY a.entrada DESC LIMIT 5`
    );
    const [locations] = await pool.query(
      `SELECT l.id, l.nombre, COUNT(a.id) AS activos
       FROM locaciones l LEFT JOIN asistencias a ON a.locacion_id = l.id AND a.salida IS NULL
       WHERE l.activa = TRUE GROUP BY l.id, l.nombre ORDER BY activos DESC, l.nombre ASC LIMIT 5`
    );
    const summary = summaryRows[0];
    res.json({
      summary: { ...summary, ausentes: Math.max(0, Number(summary.programados) - Number(summary.presentes)) },
      weekly,
      alerts,
      locations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: process.env.NODE_ENV === 'production'
        ? 'Error al cargar el dashboard administrativo'
        : `Error al cargar el dashboard administrativo: ${error.message}`,
    });
  }
};

export const getTodayOverview = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         u.id AS usuario_id,
         u.nombre,
         u.correo,
         u.telefono,
         a.id AS asignacion_id,
         l.nombre AS locacion_nombre,
         t.nombre_turno,
         t.hora_entrada,
         t.hora_salida,
         t.tolerancia_minutos,
         att.id AS asistencia_id,
         att.entrada,
         att.salida,
         att.estatus,
         TIMESTAMPDIFF(MINUTE, att.entrada, COALESCE(att.salida, NOW())) AS duracion_minutos,
         CASE
           WHEN att.id IS NOT NULL AND att.salida IS NULL AND att.estatus = 'retardo' THEN 'retardo_en_curso'
           WHEN att.id IS NOT NULL AND att.salida IS NULL THEN 'en_turno'
           WHEN att.id IS NOT NULL AND att.estatus = 'retardo' THEN 'retardo'
           WHEN att.id IS NOT NULL THEN 'presente'
           WHEN CURTIME() > ADDTIME(t.hora_entrada, SEC_TO_TIME(t.tolerancia_minutos * 60)) THEN 'ausente'
           ELSE 'pendiente'
         END AS estado_hoy
       FROM asignaciones a
       INNER JOIN usuarios u ON u.id = a.usuario_id AND u.activo = TRUE
       INNER JOIN locaciones l ON l.id = a.locacion_id
       INNER JOIN turnos t ON t.id = a.turno_id
       LEFT JOIN asistencias att
         ON att.id = (
           SELECT recent.id
           FROM asistencias recent
           WHERE recent.usuario_id = u.id
             AND DATE(recent.entrada) = CURDATE()
           ORDER BY recent.entrada DESC, recent.id DESC
           LIMIT 1
         )
       WHERE a.activa = TRUE
         AND CURDATE() BETWEEN a.fecha_inicio AND COALESCE(a.fecha_fin, '9999-12-31')
         AND JSON_CONTAINS(a.dias_semana, CAST(WEEKDAY(CURDATE()) + 1 AS JSON), '$')
       ORDER BY t.hora_entrada ASC, u.nombre ASC`
    );

    const summary = rows.reduce((total, item) => {
      total.programados += 1;
      if (item.estado_hoy === 'presente' || item.estado_hoy === 'en_turno') total.presentes += 1;
      if (item.estado_hoy === 'retardo' || item.estado_hoy === 'retardo_en_curso') total.retardos += 1;
      if (item.estado_hoy === 'pendiente') total.pendientes += 1;
      if (item.estado_hoy === 'ausente') total.ausentes += 1;
      if (item.estado_hoy === 'en_turno' || item.estado_hoy === 'retardo_en_curso') total.enTurno += 1;
      return total;
    }, { programados: 0, presentes: 0, retardos: 0, pendientes: 0, ausentes: 0, enTurno: 0 });

    res.json({ summary, employees: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al consultar la vista de hoy' });
  }
};
