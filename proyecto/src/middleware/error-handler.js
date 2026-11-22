import { AppError } from '../lib/errors.js';

// Errores que lanza el parser JSON de Express (body-parser), traducidos.
const BODY_ERRORS = {
  'entity.parse.failed': { status: 400, code: 'INVALID_JSON', message: 'El cuerpo de la petición no es JSON válido' },
  'entity.too.large': { status: 413, code: 'PAYLOAD_TOO_LARGE', message: 'El cuerpo de la petición es demasiado grande' },
};

/** Respuesta para rutas que no existen. */
export function notFound(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `No existe la ruta ${req.method} ${req.path}` } });
}

/**
 * Manejador de errores centralizado: el único sitio que decide cómo se ve un error.
 * Express lo reconoce porque recibe cuatro argumentos.
 *
 * @param {import('pino').Logger} logger
 * @returns {import('express').ErrorRequestHandler}
 */
export function errorHandler(logger) {
  return (error, req, res, next) => {
    // Si ya empezamos a enviar la respuesta (por ejemplo, un CSV en streaming),
    // no podemos cambiar el código: dejamos que Express cierre la conexión.
    if (res.headersSent) return next(error);

    if (error instanceof AppError) {
      return res.status(error.status).json({
        error: { code: error.code, message: error.message, details: error.details },
      });
    }

    const bodyError = BODY_ERRORS[error.type];
    if (bodyError) {
      return res.status(bodyError.status).json({ error: { code: bodyError.code, message: bodyError.message } });
    }

    // Error inesperado: se registra completo, pero al cliente no se le dan detalles internos.
    (req.log ?? logger).error({ err: error }, 'error no controlado');
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
  };
}
