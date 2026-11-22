-- Hito 6: la primera tabla. Los importes se guardan en céntimos (INTEGER).
CREATE TABLE expenses (
  id          INTEGER PRIMARY KEY,
  amount      INTEGER NOT NULL CHECK (amount > 0),
  category    TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  date        TEXT    NOT NULL,  -- AAAA-MM-DD
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
