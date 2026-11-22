import pino from 'pino';
import { requestContext } from './context.js';

/**
 * Logger estructurado (JSON, una línea por evento). En desarrollo se muestra
 * con colores gracias a pino-pretty, que solo se instala como devDependency.
 *
 * @param {{ level?: string, pretty?: boolean }} [options]
 */
export function createLogger({ level = 'info', pretty = false } = {}) {
  return pino({
    level,
    transport: pretty ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss' } } : undefined,
  });
}

/**
 * Devuelve el logger de la petición en curso (con su requestId) si existe,
 * o el logger general si estamos fuera de una petición.
 *
 * @param {import('pino').Logger} fallback
 */
export function currentLogger(fallback) {
  return requestContext.getStore()?.log ?? fallback;
}
