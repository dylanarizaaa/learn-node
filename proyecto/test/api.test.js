import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { startTestServer } from './helpers.js';

// Tests de integración: la aplicación real, por HTTP, con una base de datos en memoria.

describe('API: salud y errores generales', () => {
  let api;
  before(async () => (api = await startTestServer()));
  after(() => api.close());

  it('GET /api/health responde ok', async () => {
    const res = await api.request('GET', '/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.ok(res.headers.get('x-request-id'));
  });

  it('devuelve 404 en JSON para rutas desconocidas', async () => {
    const res = await api.request('GET', '/api/no-existe');
    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  it('devuelve 400 si el JSON está mal formado', async () => {
    const res = await api.request('POST', '/api/auth/login', {
      body: '{"email": ',
      headers: { 'content-type': 'application/json' },
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'INVALID_JSON');
  });
});

describe('API: autenticación', () => {
  let api;
  before(async () => (api = await startTestServer()));
  after(() => api.close());

  it('registra, impide duplicados e inicia sesión', async () => {
    const credentials = { email: 'Ana@Example.com', password: 'contraseña-segura' };
    const registered = await api.request('POST', '/api/auth/register', { body: credentials });
    assert.equal(registered.status, 201);
    assert.equal(registered.body.user.email, 'ana@example.com');
    assert.ok(registered.body.token);
    assert.equal(registered.body.user.passwordHash, undefined);

    const duplicate = await api.request('POST', '/api/auth/register', { body: credentials });
    assert.equal(duplicate.status, 409);

    const login = await api.request('POST', '/api/auth/login', { body: credentials });
    assert.equal(login.status, 200);

    const me = await api.request('GET', '/api/auth/me', { token: login.body.token });
    assert.equal(me.body.email, 'ana@example.com');
  });

  it('rechaza contraseñas incorrectas y datos no válidos', async () => {
    const wrong = await api.request('POST', '/api/auth/login', {
      body: { email: 'ana@example.com', password: 'no-es-esta' },
    });
    assert.equal(wrong.status, 401);

    const invalid = await api.request('POST', '/api/auth/register', { body: { email: 'no-es-email', password: '123' } });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.error.details.length, 2);
  });

  it('protege las rutas privadas', async () => {
    assert.equal((await api.request('GET', '/api/expenses')).status, 401);
    assert.equal((await api.request('GET', '/api/expenses', { token: 'falso' })).status, 401);
  });
});

describe('API: gastos', () => {
  let api;
  let token;
  before(async () => {
    api = await startTestServer();
    ({ token } = await api.registerUser());
  });
  after(() => api.close());

  it('crea, lee, actualiza y borra un gasto', async () => {
    const created = await api.request('POST', '/api/expenses', {
      token,
      body: { amount: '12,50', category: 'comida', description: 'Almuerzo', date: '2026-11-20' },
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.amount, 1250);
    const { id } = created.body;

    const read = await api.request('GET', `/api/expenses/${id}`, { token });
    assert.equal(read.body.description, 'Almuerzo');

    const updated = await api.request('PATCH', `/api/expenses/${id}`, { token, body: { amount: 15 } });
    assert.equal(updated.body.amount, 1500);
    assert.equal(updated.body.category, 'comida');

    assert.equal((await api.request('DELETE', `/api/expenses/${id}`, { token })).status, 204);
    assert.equal((await api.request('GET', `/api/expenses/${id}`, { token })).status, 404);
  });

  it('valida los datos con mensajes por campo', async () => {
    const res = await api.request('POST', '/api/expenses', { token, body: { amount: '-3', category: 'viajes' } });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.error.details.map((d) => d.field).sort(), ['amount', 'category']);
  });

  it('lista con filtros y paginación, y resume el mes', async () => {
    for (const [amount, category, date] of [
      [10, 'comida', '2026-10-05'],
      [20, 'comida', '2026-10-06'],
      [5, 'transporte', '2026-10-07'],
      [99, 'ocio', '2026-09-30'],
    ]) {
      await api.request('POST', '/api/expenses', { token, body: { amount, category, date } });
    }

    const october = await api.request('GET', '/api/expenses?month=2026-10&limit=2', { token });
    assert.equal(october.body.total, 3);
    assert.equal(october.body.items.length, 2);
    assert.equal(october.body.items[0].date, '2026-10-07'); // más recientes primero

    const summary = await api.request('GET', '/api/expenses/summary?month=2026-10', { token });
    assert.equal(summary.body.total, 3500);
    assert.equal(summary.body.byCategory.comida, 3000);
  });

  it('no deja ver los gastos de otro usuario', async () => {
    const mine = await api.request('POST', '/api/expenses', { token, body: { amount: 1, category: 'otros' } });
    const other = await api.registerUser();
    const res = await api.request('GET', `/api/expenses/${mine.body.id}`, { token: other.token });
    assert.equal(res.status, 404);
  });
});

describe('API: CSV, informes y eventos', () => {
  let api;
  let token;
  before(async () => {
    api = await startTestServer();
    ({ token } = await api.registerUser());
  });
  after(() => api.close());

  it('importa un CSV completo o nada', async () => {
    const headers = { 'content-type': 'text/csv' };
    const bad = 'fecha,importe,categoria,descripcion\n2026-05-01,10,comida,ok\n2026-05-02,x,comida,mal\n';
    const rejected = await api.request('POST', '/api/expenses/import', { token, headers, body: bad });
    assert.equal(rejected.status, 400);
    assert.equal(rejected.body.error.details[0].field, 'línea 3');

    const good = 'fecha,importe,categoria,descripcion\n2026-05-01,10,comida,Pan\n2026-05-03,"4,50",ocio,"Cine, palomitas"\n';
    const imported = await api.request('POST', '/api/expenses/import', { token, headers, body: good });
    assert.equal(imported.status, 201);
    assert.equal(imported.body.imported, 2); // la fila válida del CSV rechazado no se guardó

    const wrongType = await api.request('POST', '/api/expenses/import', { token, body: { a: 1 } });
    assert.equal(wrongType.status, 415);
  });

  it('exporta los gastos del mes en CSV', async () => {
    const res = await api.request('GET', '/api/expenses/export.csv?month=2026-05', { token });
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/csv/);
    assert.equal(res.body, 'fecha,importe,categoria,descripcion\n2026-05-01,10.00,comida,Pan\n2026-05-03,4.50,ocio,"Cine, palomitas"\n');
  });

  it('genera el informe anual en un worker thread', async () => {
    const res = await api.request('GET', '/api/reports/2026', { token });
    assert.equal(res.status, 200);
    assert.equal(res.body.total, 1450);
    assert.equal(res.body.months[4].count, 2);
  });

  it('envía eventos en tiempo real por SSE', async () => {
    const controller = new AbortController();
    const response = await fetch(`${api.baseUrl}/api/events`, {
      headers: { authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    assert.equal(response.headers.get('content-type'), 'text/event-stream; charset=utf-8');

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    await reader.read(); // comentario inicial ": conectado"
    await api.request('POST', '/api/expenses', { token, body: { amount: 3, category: 'salud' } });

    let received = '';
    while (!received.includes('\n\n')) received += (await reader.read()).value;
    controller.abort();

    assert.match(received, /^event: expense\.created\ndata: \{.*"amount":300/);
  });
});
