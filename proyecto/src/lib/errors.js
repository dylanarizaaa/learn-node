// Errores propios de la aplicación. Cada uno sabe qué código HTTP le corresponde,
// así el manejador de errores de Express no necesita un `if` por cada caso.

export class AppError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, code?: string, details?: unknown, cause?: unknown }} [options]
   */
  constructor(message, { status = 500, code = 'INTERNAL_ERROR', details, cause } = {}) {
    super(message, { cause });
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(details, message = 'Los datos enviados no son válidos') {
    super(message, { status: 400, code: 'VALIDATION_ERROR', details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Necesitas iniciar sesión') {
    super(message, { status: 401, code: 'UNAUTHORIZED' });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, { status: 404, code: 'NOT_FOUND' });
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, { status: 409, code: 'CONFLICT' });
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Demasiadas peticiones, inténtalo más tarde') {
    super(message, { status: 429, code: 'RATE_LIMITED' });
  }
}
