
-- Agregar restricción única para user_id en la tabla configuracion_factura
ALTER TABLE configuracion_factura 
ADD CONSTRAINT configuracion_factura_user_id_unique UNIQUE (user_id);
