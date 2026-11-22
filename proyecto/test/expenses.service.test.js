import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { describe, it, mock } from 'node:test';
import { createExpensesService } from '../src/expenses/expenses.service.js';
import { NotFoundError } from '../src/lib/errors.js';

// Test unitario: el servicio se prueba con un repositorio falso (dobles con mock.fn),
// sin base de datos. Así comprobamos solo sus reglas.
function setup(repositoryOverrides = {}) {
  const repository = {
    create: mock.fn((data) => ({ id: 1, ...data })),
    findById: mock.fn(() => undefined),
    remove: mock.fn(() => false),
    totalsByCategory: mock.fn(() => []),
    ...repositoryOverrides,
  };
  const events = new EventEmitter();
  const emitted = [];
  events.on('expense.created', (payload) => emitted.push(payload));
  return { service: createExpensesService({ repository, events }), repository, emitted };
}

describe('expenses.service', () => {
  it('usa la fecha de hoy si no se indica y emite expense.created', () => {
    const { service, repository, emitted } = setup();
    mock.timers.enable({ apis: ['Date'], now: new Date('2026-11-22T12:00:00Z') });
    try {
      const expense = service.create(7, { amount: 500, category: 'ocio', description: '' });
      assert.equal(expense.date, '2026-11-22');
    } finally {
      mock.timers.reset();
    }
    assert.equal(repository.create.mock.callCount(), 1);
    assert.equal(repository.create.mock.calls[0].arguments[0].userId, 7);
    assert.equal(emitted.length, 1);
    assert.equal(emitted[0].userId, 7);
  });

  it('lanza NotFoundError si el gasto no existe', () => {
    const { service } = setup();
    assert.throws(() => service.get(1, 99), NotFoundError);
    assert.throws(() => service.remove(1, 99), NotFoundError);
  });

  it('completa con ceros las categorías sin gastos en el resumen', () => {
    const { service } = setup({
      totalsByCategory: mock.fn(() => [{ category: 'comida', total: 900, count: 2 }]),
    });
    const summary = service.summary(1, '2026-11');
    assert.equal(summary.total, 900);
    assert.equal(summary.count, 2);
    assert.equal(summary.byCategory.comida, 900);
    assert.equal(summary.byCategory.salud, 0);
  });
});
