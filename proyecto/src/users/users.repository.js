import { ConflictError } from '../lib/errors.js';

const SQLITE_CONSTRAINT_UNIQUE = 2067;

/** @param {import('node:sqlite').DatabaseSync} db */
export function createUsersRepository(db) {
  const insert = db.prepare(`
    INSERT INTO users (email, password_hash) VALUES (:email, :passwordHash)
    RETURNING id, email, created_at AS createdAt`);
  const byEmail = db.prepare(`
    SELECT id, email, password_hash AS passwordHash, created_at AS createdAt
    FROM users WHERE email = :email`);
  const byId = db.prepare('SELECT id, email, created_at AS createdAt FROM users WHERE id = :id');

  return {
    create({ email, passwordHash }) {
      try {
        return { ...insert.get({ email, passwordHash }) };
      } catch (error) {
        // La restricción UNIQUE de la tabla es la fuente de verdad, incluso con dos
        // registros simultáneos del mismo email.
        if (error.errcode === SQLITE_CONSTRAINT_UNIQUE) {
          throw new ConflictError('Ya existe una cuenta con ese email');
        }
        throw error;
      }
    },

    findByEmail(email) {
      const row = byEmail.get({ email });
      return row ? { ...row } : undefined;
    },

    findById(id) {
      const row = byId.get({ id });
      return row ? { ...row } : undefined;
    },
  };
}
