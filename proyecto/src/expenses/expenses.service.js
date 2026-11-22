import { CATEGORIES, currentMonth, monthRange, today } from '../domain/expenses.js';
import { NotFoundError } from '../lib/errors.js';

/**
 * Casos de uso de los gastos. No sabe nada de HTTP ni de SQL: recibe datos ya
 * validados, aplica las reglas y avisa por el bus de eventos de lo que ocurre.
 *
 * @param {{
 *   repository: ReturnType<typeof import('./expenses.repository.js').createExpensesRepository>,
 *   events: import('node:events').EventEmitter,
 * }} deps
 */
export function createExpensesService({ repository, events }) {
  function get(userId, id) {
    const expense = repository.findById(userId, id);
    if (!expense) throw new NotFoundError(`No existe el gasto ${id}`);
    return expense;
  }

  return {
    get,

    create(userId, data) {
      const expense = repository.create({ ...data, userId, date: data.date ?? today() });
      events.emit('expense.created', { userId, expense });
      return expense;
    },

    importMany(userId, expenses) {
      const created = repository.createMany(
        userId,
        expenses.map((expense) => ({ ...expense, date: expense.date ?? today() })),
      );
      events.emit('expense.imported', { userId, count: created.length });
      return created;
    },

    list(userId, { month, category, limit, offset }) {
      const range = month ? monthRange(month) : {};
      const { items, total } = repository.list({ userId, ...range, category, limit, offset });
      return { items, total, limit, offset };
    },

    update(userId, id, changes) {
      const expense = repository.update(userId, id, changes);
      if (!expense) throw new NotFoundError(`No existe el gasto ${id}`);
      events.emit('expense.updated', { userId, expense });
      return expense;
    },

    remove(userId, id) {
      if (!repository.remove(userId, id)) throw new NotFoundError(`No existe el gasto ${id}`);
      events.emit('expense.deleted', { userId, expense: { id } });
    },

    summary(userId, month = currentMonth()) {
      const rows = repository.totalsByCategory(userId, monthRange(month));
      const byCategory = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
      let total = 0;
      let count = 0;
      for (const row of rows) {
        byCategory[row.category] = row.total;
        total += row.total;
        count += row.count;
      }
      return { month, count, total, byCategory };
    },

    /** Gastos de un mes como iterador perezoso (para exportar en streaming). */
    iterateMonth(userId, month = currentMonth()) {
      return repository.iterate(userId, monthRange(month));
    },

    /** Todos los gastos de un año, para el informe anual. */
    listYear(userId, year) {
      return [...repository.iterate(userId, { from: `${year}-01-01`, to: `${year}-12-31` })];
    },
  };
}
