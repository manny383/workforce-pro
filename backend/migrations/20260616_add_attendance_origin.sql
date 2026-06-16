SET @origin_column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'asistencias'
    AND COLUMN_NAME = 'origen'
);

SET @add_origin_column = IF(
  @origin_column_exists = 0,
  'ALTER TABLE asistencias ADD COLUMN origen ENUM(''horario'', ''manual'') NOT NULL DEFAULT ''horario'' AFTER estatus',
  'SELECT ''La columna asistencias.origen ya existe'' AS message'
);

PREPARE add_origin_column_statement FROM @add_origin_column;
EXECUTE add_origin_column_statement;
DEALLOCATE PREPARE add_origin_column_statement;

UPDATE asistencias
SET origen = IF(asignacion_id IS NULL, 'manual', 'horario');
