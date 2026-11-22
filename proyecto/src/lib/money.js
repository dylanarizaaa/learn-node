// Guardamos el dinero SIEMPRE en céntimos (números enteros).
// Con decimales binarios, 0.1 + 0.2 === 0.30000000000000004: con enteros no hay sorpresas.

const AMOUNT_PATTERN = /^\d+([.,]\d{1,2})?$/;

/**
 * Convierte un importe escrito por una persona en céntimos.
 * Acepta coma o punto decimal: "12,5" → 1250, "12.50" → 1250, 12.5 → 1250.
 *
 * @param {string | number} value
 * @returns {number} Céntimos (entero mayor que cero).
 * @throws {RangeError} Si el valor no es un importe válido.
 */
export function toCents(value) {
  const text = String(value).trim();
  if (!AMOUNT_PATTERN.test(text)) {
    throw new RangeError(`Importe no válido: "${value}"`);
  }
  const [units, decimals = ''] = text.replace(',', '.').split('.');
  const cents = Number(units) * 100 + Number(decimals.padEnd(2, '0'));
  if (cents <= 0) {
    throw new RangeError('El importe debe ser mayor que cero');
  }
  return cents;
}

/**
 * Da formato de moneda a una cantidad en céntimos: 1250 → "12,50 US$".
 *
 * @param {number} cents
 * @param {{ currency?: string, locale?: string }} [options]
 */
export function formatCents(cents, { currency = 'USD', locale = 'es' } = {}) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
}
