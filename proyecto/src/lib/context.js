import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Contexto de la petición en curso. Cualquier función llamada (directa o
 * indirectamente, incluso tras un `await`) mientras se atiende una petición
 * puede leer su requestId y su logger sin recibirlos como parámetro.
 *
 * @type {AsyncLocalStorage<{ requestId: string, log: import('pino').Logger }>}
 */
export const requestContext = new AsyncLocalStorage();
