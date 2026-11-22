import { TooManyRequestsError } from '../lib/errors.js';

/**
 * Limitador de peticiones por IP con ventana fija, en memoria.
 * Suficiente para un solo proceso; con varias instancias el contador
 * debe vivir en un almacén compartido (por ejemplo, Redis).
 *
 * @param {{ windowMs?: number, max?: number, now?: () => number }} [options]
 * @returns {import('express').RequestHandler}
 */
export function rateLimit({ windowMs = 60_000, max = 10, now = Date.now } = {}) {
  /** @type {Map<string, { count: number, resetAt: number }>} */
  const hits = new Map();

  // Limpieza periódica para que el Map no crezca sin fin. unref(): este
  // temporizador no impide que el proceso termine.
  setInterval(() => {
    const time = now();
    for (const [key, entry] of hits) if (entry.resetAt <= time) hits.delete(key);
  }, windowMs).unref();

  return (req, res, next) => {
    const time = now();
    const key = req.ip ?? 'desconocida';
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= time) {
      entry = { count: 0, resetAt: time + windowMs };
      hits.set(key, entry);
    }
    entry.count++;

    res.set('RateLimit-Limit', String(max));
    res.set('RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - time) / 1000)));
      throw new TooManyRequestsError();
    }
    next();
  };
}
