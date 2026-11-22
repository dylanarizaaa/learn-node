-- Hito 7: usuarios. Cada gasto pasa a pertenecer a un usuario.
CREATE TABLE users (
  id            INTEGER PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Los gastos que ya existían quedan con user_id NULL (sin dueño).
ALTER TABLE expenses ADD COLUMN user_id INTEGER REFERENCES users (id) ON DELETE CASCADE;
