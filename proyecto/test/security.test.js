import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TooManyRequestsError } from '../src/lib/errors.js';
import { rateLimit } from '../src/middleware/rate-limit.js';
import { hashPassword, verifyPassword } from '../src/users/password.js';
import { createTokenService } from '../src/users/tokens.js';

describe('contraseñas', () => {
  it('verifica la contraseña correcta y rechaza la incorrecta', async () => {
    const hash = await hashPassword('mi-contraseña');
    assert.match(hash, /^scrypt\$131072\$8\$1\$/);
    assert.equal(await verifyPassword('mi-contraseña', hash), true);
    assert.equal(await verifyPassword('otra-contraseña', hash), false);
  });

  it('usa una sal distinta en cada hash', async () => {
    assert.notEqual(await hashPassword('igual'), await hashPassword('igual'));
  });
});

describe('tokens JWT', () => {
  const tokens = createTokenService({ secret: 'x'.repeat(32), expiresIn: '1m' });

  it('firma y verifica un token', async () => {
    const token = await tokens.sign({ id: 5, email: 'ana@example.com' });
    assert.deepEqual(await tokens.verify(token), { id: 5, email: 'ana@example.com' });
  });

  it('rechaza un token firmado con otro secreto', async () => {
    const other = createTokenService({ secret: 'y'.repeat(32) });
    const token = await other.sign({ id: 5, email: 'ana@example.com' });
    await assert.rejects(tokens.verify(token));
  });
});

describe('rateLimit', () => {
  it('bloquea al superar el máximo y se reinicia con la ventana', () => {
    let time = 0;
    const limiter = rateLimit({ windowMs: 1000, max: 2, now: () => time });
    const req = { ip: '1.2.3.4' };
    const res = { headers: {}, set(name, value) { this.headers[name] = value; } };
    const next = () => {};

    limiter(req, res, next);
    limiter(req, res, next);
    assert.throws(() => limiter(req, res, next), TooManyRequestsError);
    assert.equal(res.headers['Retry-After'], '1');

    time = 1000; // nueva ventana
    assert.doesNotThrow(() => limiter(req, res, next));
  });
});
