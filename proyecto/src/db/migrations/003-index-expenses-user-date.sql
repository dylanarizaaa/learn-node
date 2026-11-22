-- Hito 9: casi todas las consultas filtran por usuario y rango de fechas.
-- Con este índice SQLite no tiene que recorrer la tabla entera.
CREATE INDEX expenses_user_date ON expenses (user_id, date);
