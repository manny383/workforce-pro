ALTER TABLE asistencias
  ADD COLUMN biometria_verificada BOOLEAN NOT NULL DEFAULT FALSE AFTER origen;

ALTER TABLE asistencias
  ADD COLUMN metodo_biometrico VARCHAR(50) AFTER biometria_verificada;

ALTER TABLE asistencias
  ADD COLUMN biometria_credential_id VARCHAR(255) AFTER metodo_biometrico;

ALTER TABLE asistencias
  ADD COLUMN biometria_verificada_en DATETIME AFTER biometria_credential_id;

ALTER TABLE asistencias
  ADD COLUMN precision_entrada DECIMAL(10,2) AFTER longitud_entrada;

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
  );
