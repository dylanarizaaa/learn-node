import { pipeline } from 'node:stream/promises';
import { createExpenseSchema } from '../expenses/expenses.schema.js';
import { ValidationError } from '../lib/errors.js';
import { csvParser } from './csv.js';

/**
 * Lee gastos desde un stream CSV (un archivo, la petición HTTP, la entrada estándar…)
 * y valida cada fila. No guarda nada: devuelve las filas válidas y los errores.
 *
 * @param {import('node:stream').Readable} source
 * @param {{ maxRows?: number }} [options]
 */
export async function readExpensesCsv(source, { maxRows = 10_000 } = {}) {
  const valid = [];
  const errors = [];

  await pipeline(source, csvParser(), async function (rows) {
    for await (const { line, record } of rows) {
      const result = createExpenseSchema.safeParse({
        date: record.fecha || undefined,
        amount: record.importe,
        category: record.categoria,
        description: record.descripcion,
      });
      if (result.success) {
        valid.push(result.data);
      } else {
        const message = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
        errors.push({ field: `línea ${line}`, message });
      }
      if (valid.length + errors.length > maxRows) {
        throw new ValidationError([], `El CSV supera el máximo de ${maxRows} filas`);
      }
    }
  });

  return { valid, errors };
}
