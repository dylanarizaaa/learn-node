import { summarize } from '../domain/expenses.js';

/**
 * Informe anual: totales por mes y por categoría, media mensual, categoría
 * principal y gasto más alto. Es una función pura: no sabe si se ejecuta en el
 * hilo principal o en un worker.
 *
 * @param {number} year
 * @param {{ amount: number, category: string, date: string }[]} expenses
 */
export function buildYearlyReport(year, expenses) {
  const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
  const byMonth = new Map(months.map((month) => [month, []]));
  for (const expense of expenses) byMonth.get(expense.date.slice(0, 7))?.push(expense);

  const monthly = months.map((month) => ({ month, ...summarize(byMonth.get(month) ?? []) }));
  const yearly = summarize(expenses);
  const activeMonths = monthly.filter((m) => m.count > 0).length;
  const [topCategory] = Object.entries(yearly.byCategory).sort((a, b) => b[1] - a[1]);
  const largest = expenses.reduce((max, e) => (max === null || e.amount > max.amount ? e : max), null);

  return {
    year,
    count: yearly.count,
    total: yearly.total,
    monthlyAverage: activeMonths > 0 ? Math.round(yearly.total / activeMonths) : 0,
    topCategory: yearly.total > 0 ? topCategory[0] : null,
    largest,
    byCategory: yearly.byCategory,
    months: monthly,
  };
}
