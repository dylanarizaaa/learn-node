import { z } from 'zod';

// Toda la configuración entra por variables de entorno y se valida al arrancar:
// si falta algo, la aplicación falla en el primer segundo y no a mitad de una petición.
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(0).max(65535).default(3000),
  DATABASE_PATH: z.string().min(1).default('data/monedero.db'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('2h'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  CURRENCY: z.string().length(3).default('USD'),
});

/** @typedef {z.infer<typeof schema>} Config */

/**
 * Lee y valida la configuración.
 *
 * @param {Record<string, string | undefined>} [env]
 * @returns {Readonly<Config>}
 */
export function loadConfig(env = process.env) {
  const result = schema.safeParse(env);
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Configuración no válida:\n${problems.join('\n')}\n¿Creaste el archivo .env a partir de .env.example?`);
  }
  return Object.freeze(result.data);
}
