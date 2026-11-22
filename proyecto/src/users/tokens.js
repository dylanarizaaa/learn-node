import { jwtVerify, SignJWT } from 'jose';

/**
 * Emite y verifica JWT firmados con HMAC-SHA256 (HS256).
 *
 * @param {{ secret: string, expiresIn?: string }} options
 */
export function createTokenService({ secret, expiresIn = '2h' }) {
  const key = new TextEncoder().encode(secret);

  return {
    /** @param {{ id: number, email: string }} user */
    sign(user) {
      return new SignJWT({ email: user.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(String(user.id))
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(key);
    },

    /**
     * Devuelve el usuario del token o lanza un error si la firma no es válida o caducó.
     *
     * @param {string} token
     */
    async verify(token) {
      // Fijar el algoritmo evita ataques que cambian "alg" en la cabecera del token.
      const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
      return { id: Number(payload.sub), email: String(payload.email) };
    },
  };
}
