import { Router } from 'express';
import { Worker } from 'node:worker_threads';
import { z } from 'zod';
import { parse } from '../lib/validation.js';

const WORKER_URL = new URL('./report.worker.js', import.meta.url);

/**
 * Calcula el informe en un worker thread para no bloquear el event loop:
 * mientras el worker trabaja, el hilo principal sigue atendiendo peticiones.
 *
 * @param {number} year
 * @param {object[]} expenses
 * @returns {Promise<ReturnType<typeof import('./yearly-report.js').buildYearlyReport>>}
 */
export function generateYearlyReport(year, expenses, { timeoutMs = 10_000 } = {}) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(WORKER_URL, { workerData: { year, expenses } });
    const timer = setTimeout(() => {
      worker.terminate();
      reject(new Error(`El informe de ${year} tardó más de ${timeoutMs} ms`));
    }, timeoutMs);

    worker.once('message', (report) => {
      clearTimeout(timer);
      resolve(report);
    });
    worker.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

const paramsSchema = z.object({ year: z.coerce.number().int().min(2000).max(2100) });

/**
 * @param {{ expenses: ReturnType<typeof import('../expenses/expenses.service.js').createExpensesService> }} deps
 */
export function reportsRouter({ expenses }) {
  const router = Router();

  router.get('/:year', async (req, res) => {
    const { year } = parse(paramsSchema, req.params);
    const report = await generateYearlyReport(year, expenses.listYear(req.user.id, year));
    res.json(report);
  });

  return router;
}
