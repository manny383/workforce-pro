-- =========================================
-- WORKFORCE PRO
-- Railway-safe schema
-- =========================================
-- Run this inside the Railway MySQL database.
-- Railway already creates and selects the database, so this file avoids
-- DROP DATABASE, CREATE DATABASE, and USE statements.

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'supervisor', 'empleado') DEFAULT 'empleado',
  telefono VARCHAR(20),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS turnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_turno VARCHAR(50) NOT NULL,
  hora_entrada TIME NOT NULL,
  hora_salida TIME NOT NULL,
  tolerancia_minutos INT DEFAULT 10,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios_turnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  turno_id INT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE CASCADE,
  UNIQUE KEY uq_usuario_turno (usuario_id, turno_id)
);

CREATE TABLE IF NOT EXISTS locaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  latitud DECIMAL(10,8) NOT NULL,
  longitud DECIMAL(11,8) NOT NULL,
  radio_permitido INT NOT NULL DEFAULT 100,
  activa BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios_locaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  locacion_id INT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (locacion_id) REFERENCES locaciones(id) ON DELETE CASCADE,
  UNIQUE KEY uq_usuario_locacion (usuario_id, locacion_id)
);

CREATE TABLE IF NOT EXISTS asignaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  locacion_id INT NOT NULL,
  turno_id INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NULL,
  dias_semana JSON NOT NULL,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (locacion_id) REFERENCES locaciones(id),
  FOREIGN KEY (turno_id) REFERENCES turnos(id),
  INDEX idx_asignaciones_usuario (usuario_id),
  INDEX idx_asignaciones_locacion (locacion_id),
  INDEX idx_asignaciones_vigencia (fecha_inicio, fecha_fin)
);

CREATE TABLE IF NOT EXISTS asistencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  locacion_id INT,
  asignacion_id INT,
  entrada DATETIME,
  salida DATETIME,
  estatus ENUM('presente', 'retardo', 'ausente') DEFAULT 'presente',
  origen ENUM('horario', 'manual') NOT NULL DEFAULT 'horario',
  latitud_entrada DECIMAL(10,8),
  longitud_entrada DECIMAL(11,8),
  latitud_salida DECIMAL(10,8),
  longitud_salida DECIMAL(11,8),
  distancia_entrada DECIMAL(10,2),
  distancia_salida DECIMAL(10,2),
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (locacion_id) REFERENCES locaciones(id),
  FOREIGN KEY (asignacion_id) REFERENCES asignaciones(id),
  INDEX idx_asistencias_usuario_id (usuario_id),
  INDEX idx_asistencias_entrada (entrada)
);

INSERT IGNORE INTO turnos (
  id,
  nombre_turno,
  hora_entrada,
  hora_salida,
  tolerancia_minutos
)
VALUES
  (1, 'Matutino', '07:00:00', '15:00:00', 10),
  (2, 'Vespertino', '15:00:00', '23:00:00', 10),
  (3, 'Nocturno', '23:00:00', '07:00:00', 10);

INSERT IGNORE INTO locaciones (
  id,
  nombre,
  descripcion,
  latitud,
  longitud,
  radio_permitido
)
VALUES (
  1,
  'Planta Principal',
  'Acceso principal',
  19.70000000,
  -101.18400000,
  100
);

INSERT IGNORE INTO usuarios (
  id,
  nombre,
  correo,
  password_hash,
  rol
)
VALUES (
  1,
  'Administrador',
  'admin@workforcepro.com',
  '$2b$10$4BxauX6ceX9gQtMisMW0S.BguxwtWu8oHop6mgxYC1pRF2C2ifLsG',
  'admin'
)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  rol = VALUES(rol),
  activo = TRUE;

INSERT IGNORE INTO usuarios_turnos (
  usuario_id,
  turno_id
)
VALUES (
  1,
  1
);

INSERT IGNORE INTO usuarios_locaciones (
  usuario_id,
  locacion_id
)
VALUES (
  1,
  1
);
