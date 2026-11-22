import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { currentMonth, monthRange, summarize } from '../src/domain/expenses.js';
import { buildYearlyReport } from '../src/reports/yearly-report.js';

const sample = [
  { amount: 1250, category: 'comida', date: '2026-01-10' },
  { amount: 300, category: 'transporte', date: '2026-01-12' },
  { amount: 4000, category: 'comida', date: '2026-03-02' },
];

describe('summarize', () => {
  it('suma el total y agrupa por categoría', () => {
    const summary = summarize(sample);
    assert.equal(summary.count, 3);
    assert.equal(summary.total, 5550);
    assert.equal(summary.byCategory.comida, 5250);
    assert.equal(summary.byCategory.ocio, 0); // todas las categorías aparecen
  });

  it('funciona con una lista vacía', () => {
    assert.deepEqual(summarize([]).total, 0);
  });
});

describe('monthRange', () => {
  it('calcula el último día de cada mes, incluidos los bisiestos', () => {
    assert.deepEqual(monthRange('2026-11'), { from: '2026-11-01', to: '2026-11-30' });
    assert.deepEqual(monthRange('2028-02'), { from: '2028-02-01', to: '2028-02-29' });
    assert.deepEqual(monthRange('2026-02'), { from: '2026-02-01', to: '2026-02-28' });
  });

  it('rechaza formatos incorrectos', () => {
    assert.throws(() => monthRange('2026-13'), RangeError);
    assert.throws(() => monthRange('nov'), RangeError);
  });
});

describe('currentMonth', () => {
  it('devuelve AAAA-MM', () => {
    assert.equal(currentMonth(new Date('2026-11-22T10:00:00Z')), '2026-11');
  });
});

describe('buildYearlyReport', () => {
  it('agrupa por mes y calcula la media de los meses con gastos', () => {
    const report = buildYearlyReport(2026, sample);
    assert.equal(report.months.length, 12);
    assert.equal(report.months[0].total, 1550);
    assert.equal(report.months[1].total, 0);
    assert.equal(report.monthlyAverage, Math.round(5550 / 2));
    assert.equal(report.topCategory, 'comida');
    assert.equal(report.largest.amount, 4000);
  });
});
