import { EventEmitter } from 'node:events';
import { join } from 'node:path';
import express from 'express';
import helmet from 'helmet';
import { sseHandler } from './events/sse.js';
import { createExpensesRepository } from './expenses/expenses.repository.js';
import { expensesRouter } from './expenses/expenses.routes.js';
import { createExpensesService } from './expenses/expenses.service.js';
import { healthRouter } from './health.js';
import { authenticate } from './middleware/authenticate.js';
import { errorHandler, notFound } from './middleware/error-handler.js';
import { rateLimit } from './middleware/rate-limit.js';
import { requestContextMiddleware } from './middleware/request-context.js';
import { reportsRouter } from './reports/reports.js';
import { authRouter } from './users/auth.routes.js';
import { createAuthService } from './users/auth.service.js';
import { createTokenService } from './users/tokens.js';
import { createUsersRepository } from './users/users.repository.js';

/**
 * Construye la aplicación Express. Recibe todas sus dependencias desde fuera
 * (configuración, base de datos, logger, bus de eventos), lo que permite crear
 * una instancia aislada por test con una base de datos en memoria.
 *
 * @param {{
 *   config: import('./config.js').Config,
 *   db: import('node:sqlite').DatabaseSync,
 *   logger: import('pino').Logger,
 *   events?: EventEmitter,
 * }} deps
 */
export function createApp({ config, db, logger, events = new EventEmitter() }) {
  // 1. Capa de datos y servicios
  const tokens = createTokenService({ secret: config.JWT_SECRET, expiresIn: config.JWT_EXPIRES_IN });
  const expenses = createExpensesService({ repository: createExpensesRepository(db), events });
  const auth = createAuthService({ users: createUsersRepository(db), tokens });
  const requireAuth = authenticate(tokens);

  // 2. Middleware global (el orden importa)
  const app = express();
  // Detrás de un proxy inverso, req.ip debe salir de X-Forwarded-For (y solo si confiamos en él).
  if (config.TRUST_PROXY > 0) app.set('trust proxy', config.TRUST_PROXY);
  app.use(helmet());
  app.use(requestContextMiddleware(logger));
  app.use(express.json({ limit: '100kb' }));
  app.use(express.static(join(import.meta.dirname, '..', 'public')));

  // 3. Rutas
  app.use('/api', healthRouter({ db }));
  app.use('/api/auth', authRouter({ auth, requireAuth, limiter: rateLimit({ windowMs: 60_000, max: 10 }) }));
  app.use('/api/expenses', requireAuth, expensesRouter({ expenses }));
  app.use('/api/reports', requireAuth, reportsRouter({ expenses }));
  app.get('/api/events', requireAuth, sseHandler(events));

  // 4. Al final: 404 y manejador de errores
  app.use(notFound);
  app.use(errorHandler(logger));

  return app;
}
