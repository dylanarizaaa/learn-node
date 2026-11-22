import { z } from 'zod';
import { ValidationError } from './errors.js';

// Mensajes de validación en español para toda la aplicación.
z.config(z.locales.es());

/**
 * Valida `input` con un schema de Zod. Si no es válido lanza un ValidationError
 * con la lista de problemas; si lo es, devuelve los datos ya limpios y tipados.
 *
 * @template {z.ZodType} T
 * @param {T} schema
 * @param {unknown} input
 * @returns {z.infer<T>}
 */
export function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || null,
      message: issue.message,
    }));
    throw new ValidationError(details);
  }
  return result.data;
}
