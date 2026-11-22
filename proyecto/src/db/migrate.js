import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_DIR = join(import.meta.dirname, 'migrations');

/**
 * Aplica, en orden, los archivos .sql de migrations/ que aún no se hayan aplicado.
 * Cada migración se registra en la tabla `migrations` para no repetirla.
 *
 * @param {import('node:sqlite').DatabaseSync} db
 * @param {{ log?: (message: string) => void }} [options]
 * @returns {string[]} Nombres de las migraciones aplicadas en esta ejecución.
 */
export function migrate(db, { log = () => {} } = {}) {
  db.exec(`CREATE TABLE IF NOT EXISTS migrations (
    name TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )`);

  // IMMEDIATE toma el bloqueo de escritura desde el principio: si varios procesos
  // arrancan a la vez (cluster), el segundo espera y luego ve las migraciones ya hechas.
  db.exec('BEGIN IMMEDIATE');
  try {
    const applied = new Set(db.prepare('SELECT name FROM migrations').all().map((row) => row.name));
    const pending = readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql') && !applied.has(file))
      .sort();

    for (const file of pending) {
      db.exec(readFileSync(join(MIGRATIONS_DIR, file), 'utf8'));
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(file);
      log(`Migración aplicada: ${file}`);
    }
    db.exec('COMMIT');
    return pending;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

// `node src/db/migrate.js` ejecuta las migraciones sin arrancar el servidor.
if (import.meta.main) {
  const { openDatabase } = await import('./database.js');
  const db = openDatabase(process.env.DATABASE_PATH ?? 'data/monedero.db');
  const applied = migrate(db, { log: console.log });
  if (applied.length === 0) console.log('La base de datos ya está al día.');
  db.close();
}
