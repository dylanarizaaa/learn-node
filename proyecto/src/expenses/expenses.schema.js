import { z } from 'zod';
import { CATEGORIES } from '../domain/expenses.js';
import { toCents } from '../lib/money.js';

// El importe llega como texto ("12,50") o número (12.5) y sale como céntimos (1250).
const amount = z.union([z.string(), z.number()]).transform((value, ctx) => {
  try {
    return toCents(value);
  } catch (error) {
    ctx.addIssue({ code: 'custom', message: error.message });
    return z.NEVER;
  }
});

const fields = {
  amount,
  category: z.enum(CATEGORIES),
  description: z.string().trim().max(200),
  date: z.iso.date(),
};

export const createExpenseSchema = z.object({
  ...fields,
  description: fields.description.default(''),
  date: fields.date.optional(), // si no llega, el servicio usa la fecha de hoy
});

// Para actualizar, todos los campos son opcionales, pero debe llegar al menos uno.
export const updateExpenseSchema = z
  .object(fields)
  .partial()
  .refine((changes) => Object.keys(changes).length > 0, { message: 'Envía al menos un campo para actualizar' });

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Usa el formato AAAA-MM');

export const listExpensesSchema = z.object({
  month: month.optional(),
  category: z.enum(CATEGORIES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const summarySchema = z.object({ month: month.optional() });

export const idSchema = z.object({ id: z.coerce.number().int().positive() });
