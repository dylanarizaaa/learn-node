import { transaction } from '../db/database.js';

// Columnas que devolvemos, con nombres en camelCase para JavaScript.
const COLUMNS = 'id, amount, category, description, date, created_at AS createdAt';
const EDITABLE = ['amount', 'category', 'description', 'date'];

/** node:sqlite devuelve objetos sin prototipo; los convertimos en objetos normales. */
const toExpense = (row) => (row ? { ...row } : undefined);

/**
 * Repositorio de gastos: la única parte de la aplicación que conoce el SQL.
 * Todas las consultas usan parámetros (:nombre), nunca texto concatenado,
 * así que no hay riesgo de inyección SQL.
 *
 * @param {import('node:sqlite').DatabaseSync} db
 */
export function createExpensesRepository(db) {
  const insert = db.prepare(`
    INSERT INTO expenses (user_id, amount, category, description, date)
    VALUES (:userId, :amount, :category, :description, :date)
    RETURNING ${COLUMNS}`);
  const findById = db.prepare(`SELECT ${COLUMNS} FROM expenses WHERE id = :id AND user_id = :userId`);
  const remove = db.prepare('DELETE FROM expenses WHERE id = :id AND user_id = :userId');
  const totalsByCategory = db.prepare(`
    SELECT category, SUM(amount) AS total, COUNT(*) AS count
    FROM expenses
    WHERE user_id = :userId AND date BETWEEN :from AND :to
    GROUP BY category`);
  const inRange = db.prepare(`
    SELECT ${COLUMNS} FROM expenses
    WHERE user_id = :userId AND date BETWEEN :from AND :to
    ORDER BY date, id`);

  /** Construye el WHERE de los listados a partir de los filtros presentes. */
  function where({ userId, from, to, category }) {
    const conditions = ['user_id = :userId'];
    const params = { userId };
    if (from) {
      conditions.push('date >= :from');
      params.from = from;
    }
    if (to) {
      conditions.push('date <= :to');
      params.to = to;
    }
    if (category) {
      conditions.push('category = :category');
      params.category = category;
    }
    return { sql: conditions.join(' AND '), params };
  }

  return {
    create({ userId, amount, category, description = '', date }) {
      return toExpense(insert.get({ userId, amount, category, description, date }));
    },

    /** Inserta muchos gastos en una sola transacción: o entran todos o ninguno. */
    createMany(userId, expenses) {
      return transaction(db, () =>
        expenses.map(({ amount, category, description = '', date }) =>
          toExpense(insert.get({ userId, amount, category, description, date })),
        ),
      );
    },

    findById(userId, id) {
      return toExpense(findById.get({ userId, id }));
    },

    list({ userId, from, to, category, limit = 20, offset = 0 }) {
      const filter = where({ userId, from, to, category });
      const items = db
        .prepare(
          `SELECT ${COLUMNS} FROM expenses WHERE ${filter.sql}
           ORDER BY date DESC, id DESC LIMIT :limit OFFSET :offset`,
        )
        .all({ ...filter.params, limit, offset })
        .map(toExpense);
      const { total } = db.prepare(`SELECT COUNT(*) AS total FROM expenses WHERE ${filter.sql}`).get(filter.params);
      return { items, total };
    },

    update(userId, id, changes) {
      const keys = EDITABLE.filter((key) => changes[key] !== undefined);
      const params = Object.fromEntries(keys.map((key) => [key, changes[key]]));
      const row = db
        .prepare(
          `UPDATE expenses SET ${keys.map((key) => `${key} = :${key}`).join(', ')}
           WHERE id = :id AND user_id = :userId RETURNING ${COLUMNS}`,
        )
        .get({ ...params, id, userId });
      return toExpense(row);
    },

    remove(userId, id) {
      return remove.run({ userId, id }).changes > 0;
    },

    /** Totales por categoría calculados por SQLite (GROUP BY). */
    totalsByCategory(userId, { from, to }) {
      return totalsByCategory.all({ userId, from, to }).map(toExpense);
    },

    /** Recorre los gastos de un rango fila a fila, sin cargarlos todos en memoria. */
    *iterate(userId, { from, to }) {
      for (const row of inRange.iterate({ userId, from, to })) yield toExpense(row);
    },
  };
}
