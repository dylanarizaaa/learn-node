import { NotFoundError, UnauthorizedError } from '../lib/errors.js';
import { hashPassword, verifyPassword } from './password.js';

/**
 * Registro, inicio de sesión y perfil.
 *
 * @param {{
 *   users: ReturnType<typeof import('./users.repository.js').createUsersRepository>,
 *   tokens: ReturnType<typeof import('./tokens.js').createTokenService>,
 * }} deps
 */
export function createAuthService({ users, tokens }) {
  // Hash de relleno: si el email no existe verificamos contra él igualmente, para que
  // la respuesta tarde lo mismo y no revele qué emails están registrados.
  let dummyHash;
  const getDummyHash = () => (dummyHash ??= hashPassword('contraseña-de-relleno'));

  return {
    async register({ email, password }) {
      const passwordHash = await hashPassword(password);
      const user = users.create({ email, passwordHash });
      return { user, token: await tokens.sign(user) };
    },

    async login({ email, password }) {
      const user = users.findByEmail(email);
      const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
      if (!user || !valid) throw new UnauthorizedError('Email o contraseña incorrectos');
      const { passwordHash, ...publicUser } = user;
      return { user: publicUser, token: await tokens.sign(publicUser) };
    },

    me(id) {
      const user = users.findById(id);
      if (!user) throw new NotFoundError('El usuario ya no existe');
      return user;
    },
  };
}
