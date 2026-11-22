import { UnauthorizedError } from '../lib/errors.js';

/**
 * Exige un token válido en la cabecera `Authorization: Bearer <token>`.
 * Si lo es, deja el usuario en `req.user` para los siguientes handlers.
 *
 * @param {ReturnType<typeof import('../users/tokens.js').createTokenService>} tokens
 * @returns {import('express').RequestHandler}
 */
export function authenticate(tokens) {
  return async (req, res, next) => {
    const [scheme, token] = (req.get('authorization') ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedError('Falta la cabecera Authorization: Bearer <token>');
    }
    try {
      req.user = await tokens.verify(token);
    } catch {
      throw new UnauthorizedError('El token no es válido o ha caducado');
    }
    next();
  };
}
