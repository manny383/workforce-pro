SET @biometria_verificada_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'asistencias'
    AND COLUMN_NAME = 'biometria_verificada'
);

SET @sql = IF(
  @biometria_verificada_exists = 0,
  'ALTER TABLE asistencias ADD COLUMN biometria_verificada BOOLEAN NOT NULL DEFAULT FALSE AFTER origen',
  'SELECT ''biometria_verificada ya existe'' AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @metodo_biometrico_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'asistencias'
    AND COLUMN_NAME = 'metodo_biometrico'
);

SET @sql = IF(
  @metodo_biometrico_exists = 0,
  'ALTER TABLE asistencias ADD COLUMN metodo_biometrico VARCHAR(50) AFTER biometria_verificada',
  'SELECT ''metodo_biometrico ya existe'' AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @biometria_credential_id_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'asistencias'
    AND COLUMN_NAME = 'biometria_credential_id'
);

SET @sql = IF(
  @biometria_credential_id_exists = 0,
  'ALTER TABLE asistencias ADD COLUMN biometria_credential_id VARCHAR(255) AFTER metodo_biometrico',
  'SELECT ''biometria_credential_id ya existe'' AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @biometria_verificada_en_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'asistencias'
    AND COLUMN_NAME = 'biometria_verificada_en'
);

SET @sql = IF(
  @biometria_verificada_en_exists = 0,
  'ALTER TABLE asistencias ADD COLUMN biometria_verificada_en DATETIME AFTER biometria_credential_id',
  'SELECT ''biometria_verificada_en ya existe'' AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @precision_entrada_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'asistencias'
    AND COLUMN_NAME = 'precision_entrada'
);

SET @sql = IF(
  @precision_entrada_exists = 0,
  'ALTER TABLE asistencias ADD COLUMN precision_entrada DECIMAL(10,2) AFTER longitud_entrada',
  'SELECT ''precision_entrada ya existe'' AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'asistencias'
  AND COLUMN_NAME IN (
    'biometria_verificada',
    'metodo_biometrico',
    'biometria_credential_id',
    'biometria_verificada_en',
    'precision_entrada'
  )
ORDER BY FIELD(
  COLUMN_NAME,
  'biometria_verificada',
  'metodo_biometrico',
  'biometria_credential_id',
  'biometria_verificada_en',
  'precision_entrada'
);
