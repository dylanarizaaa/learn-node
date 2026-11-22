import { randomUUID } from 'node:crypto';
import { requestContext } from '../lib/context.js';

const VALID_ID = /^[\w-]{1,64}$/;

/**
 * Da a cada petición un identificador (o reutiliza el del proxy en X-Request-Id),
 * un logger hijo que lo incluye en cada línea, y registra la respuesta al terminar.
 *
 * @param {import('pino').Logger} logger
 * @returns {import('express').RequestHandler}
 */
export function requestContextMiddleware(logger) {
  return (req, res, next) => {
    const incoming = req.get('x-request-id');
    const requestId = incoming && VALID_ID.test(incoming) ? incoming : randomUUID();
    const log = logger.child({ requestId });
    const start = performance.now();

    req.log = log;
    res.set('X-Request-Id', requestId);
    res.on('finish', () => {
      log.info(
        { method: req.method, url: req.originalUrl, status: res.statusCode, ms: Math.round(performance.now() - start) },
        'petición atendida',
      );
    });

    // Todo lo que ocurra a partir de aquí (incluso tras un await) ve este contexto.
    requestContext.run({ requestId, log }, next);
  };
}
