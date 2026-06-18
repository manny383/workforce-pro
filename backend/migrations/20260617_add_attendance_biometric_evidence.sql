SET @biometria_verificada_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'asistencias'
    AND COLUMN_NAME = 'biometria_verificada'
);

SET @add_biometria_verificada = IF(
  @biometria_verificada_exists = 0,
  'ALTER TABLE asistencias ADD COLUMN biometria_verificada BOOLEAN NOT NULL DEFAULT FALSE AFTER origen',
  'SELECT ''La columna asistencias.biometria_verificada ya existe'' AS message'
);

PREPARE add_biometria_verificada_statement FROM @add_biometria_verificada;
EXECUTE add_biometria_verificada_statement;
DEALLOCATE PREPARE add_biometria_verificada_statement;

SET @metodo_biometrico_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'asistencias'
    AND COLUMN_NAME = 'metodo_biometrico'
);

SET @add_metodo_biometrico = IF(
  @metodo_biometrico_exists = 0,
  'ALTER TABLE asistencias ADD COLUMN metodo_biometrico VARCHAR(50) AFTER biometria_verificada',
  'SELECT ''La columna asistencias.metodo_biometrico ya existe'' AS message'
);

PREPARE add_metodo_biometrico_statement FROM @add_metodo_biometrico;
EXECUTE add_metodo_biometrico_statement;
DEALLOCATE PREPARE add_metodo_biometrico_statement;

SET @biometria_credential_id_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'asistencias'
    AND COLUMN_NAME = 'biometria_credential_id'
);

SET @add_biometria_credential_id = IF(
  @biometria_credential_id_exists = 0,
  'ALTER TABLE asistencias ADD COLUMN biometria_credential_id VARCHAR(255) AFTER metodo_biometrico',
  'SELECT ''La columna asistencias.biometria_credential_id ya existe'' AS message'
);

PREPARE add_biometria_credential_id_statement FROM @add_biometria_credential_id;
EXECUTE add_biometria_credential_id_statement;
DEALLOCATE PREPARE add_biometria_credential_id_statement;

SET @biometria_verificada_en_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'asistencias'
    AND COLUMN_NAME = 'biometria_verificada_en'
);

SET @add_biometria_verificada_en = IF(
  @biometria_verificada_en_exists = 0,
  'ALTER TABLE asistencias ADD COLUMN biometria_verificada_en DATETIME AFTER biometria_credential_id',
  'SELECT ''La columna asistencias.biometria_verificada_en ya existe'' AS message'
);

PREPARE add_biometria_verificada_en_statement FROM @add_biometria_verificada_en;
EXECUTE add_biometria_verificada_en_statement;
DEALLOCATE PREPARE add_biometria_verificada_en_statement;

SET @precision_entrada_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'asistencias'
    AND COLUMN_NAME = 'precision_entrada'
);

SET @add_precision_entrada = IF(
  @precision_entrada_exists = 0,
  'ALTER TABLE asistencias ADD COLUMN precision_entrada DECIMAL(10,2) AFTER longitud_entrada',
  'SELECT ''La columna asistencias.precision_entrada ya existe'' AS message'
);

PREPARE add_precision_entrada_statement FROM @add_precision_entrada;
EXECUTE add_precision_entrada_statement;
DEALLOCATE PREPARE add_precision_entrada_statement;
