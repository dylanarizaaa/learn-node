import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatCents, toCents } from '../src/lib/money.js';

describe('toCents', () => {
  it('acepta coma o punto decimal y números', () => {
    assert.equal(toCents('12,50'), 1250);
    assert.equal(toCents('12.5'), 1250);
    assert.equal(toCents(' 7 '), 700);
    assert.equal(toCents(3), 300);
    assert.equal(toCents('0,01'), 1);
  });

  it('evita los errores de coma flotante', () => {
    assert.notEqual(0.1 + 0.2, 0.3);
    assert.equal(toCents('0.1') + toCents('0.2'), toCents('0.3'));
  });

  it('rechaza importes no válidos', () => {
    for (const value of ['', 'abc', '-5', '1,234', '0', '12.', '1e3']) {
      assert.throws(() => toCents(value), RangeError, `debería rechazar "${value}"`);
    }
  });
});

describe('formatCents', () => {
  it('formatea en la moneda y el idioma indicados', () => {
    assert.match(formatCents(1250, { currency: 'EUR', locale: 'es-ES' }), /^12,50\s€$/);
    assert.match(formatCents(199, { currency: 'USD', locale: 'en-US' }), /^\$1\.99$/);
  });
});
