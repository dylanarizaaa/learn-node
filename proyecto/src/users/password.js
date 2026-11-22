import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

// Parámetros mínimos recomendados por OWASP para scrypt.
const DEFAULT_PARAMS = { N: 2 ** 17, r: 8, p: 1 };
const KEY_LENGTH = 64;
// scrypt usa N * r * 128 bytes de memoria (128 MiB): el límite por defecto (32 MiB) no alcanza.
const MAX_MEMORY = 256 * 1024 * 1024;

/**
 * Calcula el hash de una contraseña con una sal aleatoria.
 * El resultado incluye algoritmo, parámetros y sal: "scrypt$N$r$p$sal$hash".
 * Así podremos subir el coste en el futuro sin invalidar los hashes antiguos.
 *
 * @param {string} password
 */
export async function hashPassword(password, params = DEFAULT_PARAMS) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH, { ...params, maxmem: MAX_MEMORY });
  return ['scrypt', params.N, params.r, params.p, salt.toString('base64'), hash.toString('base64')].join('$');
}

/**
 * Comprueba una contraseña contra un hash guardado.
 *
 * @param {string} password
 * @param {string} stored
 */
export async function verifyPassword(password, stored) {
  const [algorithm, N, r, p, salt, hash] = stored.split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = await scryptAsync(password, Buffer.from(salt, 'base64'), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: MAX_MEMORY,
  });
  // Comparación en tiempo constante: no revela cuántos bytes coinciden.
  return timingSafeEqual(actual, expected);
}
