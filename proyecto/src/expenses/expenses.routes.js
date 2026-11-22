import { Router } from 'express';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { expensesToCsv } from '../csv/csv.js';
import { readExpensesCsv } from '../csv/read-expenses.js';
import { AppError, ValidationError } from '../lib/errors.js';
import { parse } from '../lib/validation.js';
import {
  createExpenseSchema,
  idSchema,
  listExpensesSchema,
  summarySchema,
  updateExpenseSchema,
} from './expenses.schema.js';

/**
 * Rutas HTTP de /api/expenses. Cada handler hace solo tres cosas:
 * validar la entrada, llamar al servicio y responder.
 *
 * @param {{ expenses: ReturnType<typeof import('./expenses.service.js').createExpensesService> }} deps
 */
export function expensesRouter({ expenses }) {
  const router = Router();

  router.get('/', (req, res) => {
    const query = parse(listExpensesSchema, req.query);
    res.json(expenses.list(req.user.id, query));
  });

  router.post('/', (req, res) => {
    const data = parse(createExpenseSchema, req.body);
    res.status(201).json(expenses.create(req.user.id, data));
  });

  // Las rutas fijas van antes que '/:id' para que "summary" no se tome como un id.
  router.get('/summary', (req, res) => {
    const { month } = parse(summarySchema, req.query);
    res.json(expenses.summary(req.user.id, month));
  });

  router.get('/export.csv', async (req, res) => {
    const { month } = parse(summarySchema, req.query);
    res.type('text/csv').attachment(`gastos-${month ?? 'mes-actual'}.csv`);
    // Fila a fila: la base de datos, el CSV y la red avanzan al ritmo del cliente.
    await pipeline(Readable.from(expenses.iterateMonth(req.user.id, month)), expensesToCsv(), res);
  });

  router.post('/import', async (req, res) => {
    if (!req.is('text/csv')) {
      throw new AppError('Envía el archivo con la cabecera Content-Type: text/csv', {
        status: 415,
        code: 'UNSUPPORTED_MEDIA_TYPE',
      });
    }
    const { valid, errors } = await readExpensesCsv(req);
    if (errors.length > 0) {
      throw new ValidationError(errors.slice(0, 20), `Hay ${errors.length} filas con errores; no se importó nada`);
    }
    const created = expenses.importMany(req.user.id, valid);
    res.status(201).json({ imported: created.length });
  });

  router.get('/:id', (req, res) => {
    const { id } = parse(idSchema, req.params);
    res.json(expenses.get(req.user.id, id));
  });

  router.patch('/:id', (req, res) => {
    const { id } = parse(idSchema, req.params);
    const changes = parse(updateExpenseSchema, req.body);
    res.json(expenses.update(req.user.id, id, changes));
  });

  router.delete('/:id', (req, res) => {
    const { id } = parse(idSchema, req.params);
    expenses.remove(req.user.id, id);
    res.status(204).end();
  });

  return router;
}
