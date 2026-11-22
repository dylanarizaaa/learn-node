import { EventEmitter, once } from 'node:events';
import { createServer } from 'node:http';
import pino from 'pino';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db/database.js';
import { migrate } from '../src/db/migrate.js';

export const TEST_CONFIG = Object.freeze({
  NODE_ENV: 'test',
  PORT: 0,
  DATABASE_PATH: ':memory:',
  JWT_SECRET: 'un-secreto-de-pruebas-con-mas-de-32-caracteres',
  JWT_EXPIRES_IN: '5m',
  LOG_LEVEL: 'silent',
  CURRENCY: 'USD',
});

let userCounter = 0;

/**
 * Arranca la aplicación real en un puerto libre (0 = el sistema elige) con una
 * base de datos en memoria. Cada llamada crea una instancia aislada.
 */
export async function startTestServer() {
  const db = openDatabase(':memory:');
  migrate(db);
  const events = new EventEmitter();
  const app = createApp({ config: TEST_CONFIG, db, logger: pino({ level: 'silent' }), events });
  const server = createServer(app).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  /**
   * Hace una petición y devuelve { status, headers, body } con el JSON ya parseado.
   * @param {string} method
   * @param {string} path
   * @param {{ body?: unknown, token?: string, headers?: Record<string, string> }} [options]
   */
  async function request(method, path, { body, token, headers = {} } = {}) {
    const init = { method, headers: { ...headers } };
    if (token) init.headers.authorization = `Bearer ${token}`;
    if (typeof body === 'string') {
      init.body = body;
    } else if (body !== undefined) {
      init.body = JSON.stringify(body);
      init.headers['content-type'] = 'application/json';
    }
    const response = await fetch(baseUrl + path, init);
    const text = await response.text();
    const isJson = response.headers.get('content-type')?.includes('application/json');
    return { status: response.status, headers: response.headers, body: isJson && text ? JSON.parse(text) : text };
  }

  /** Registra un usuario nuevo y devuelve { user, token }. */
  async function registerUser(email = `persona${++userCounter}@example.com`) {
    const response = await request('POST', '/api/auth/register', {
      body: { email, password: 'contraseña-segura' },
    });
    return response.body;
  }

  async function close() {
    events.emit('shutdown');
    server.closeAllConnections();
    server.close();
    await once(server, 'close');
    db.close();
  }

  return { baseUrl, db, events, request, registerUser, close };
}
