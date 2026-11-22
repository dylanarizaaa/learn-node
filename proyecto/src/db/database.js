import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/**
 * Abre (o crea) la base de datos SQLite. `node:sqlite` viene incluido en Node:
 * no hay que instalar ni compilar nada.
 *
 * @param {string} path Ruta del archivo o ':memory:' para una base temporal (tests).
 */
export function openDatabase(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;   -- lecturas y escrituras simultáneas sin bloquearse
    PRAGMA foreign_keys = ON;    -- SQLite no comprueba las claves foráneas si no se activa
    PRAGMA busy_timeout = 5000;  -- si otro proceso escribe, espera hasta 5 s en vez de fallar
  `);
  return db;
}

/**
 * Ejecuta `fn` dentro de una transacción: o se guardan todos los cambios o ninguno.
 *
 * @template T
 * @param {DatabaseSync} db
 * @param {() => T} fn
 * @returns {T}
 */
export function transaction(db, fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
