// Reglas del dominio: funciones puras, sin acceso a disco, red ni base de datos.
// Por eso se pueden usar igual desde la CLI, la API, un worker o un test.

export const CATEGORIES = Object.freeze(['comida', 'transporte', 'hogar', 'ocio', 'salud', 'otros']);

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Suma los importes y los agrupa por categoría.
 *
 * @param {{ amount: number, category: string }[]} expenses
 */
export function summarize(expenses) {
  const byCategory = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
  let total = 0;
  for (const { amount, category } of expenses) {
    total += amount;
    byCategory[category] = (byCategory[category] ?? 0) + amount;
  }
  return { count: expenses.length, total, byCategory };
}

/**
 * Primer y último día de un mes: "2026-02" → { from: "2026-02-01", to: "2026-02-28" }.
 *
 * @param {string} month Mes en formato AAAA-MM.
 */
export function monthRange(month) {
  if (!MONTH_PATTERN.test(month)) {
    throw new RangeError(`Mes no válido: "${month}" (usa AAAA-MM)`);
  }
  const [year, monthNumber] = month.split('-').map(Number);
  // El día 0 del mes siguiente es el último día de este mes.
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, '0')}` };
}

/** Mes actual en formato AAAA-MM (UTC). */
export function currentMonth(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

/** Fecha de hoy en formato AAAA-MM-DD (UTC). */
export function today(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
