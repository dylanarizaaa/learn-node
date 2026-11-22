import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { describe, it } from 'node:test';
import { csvParser, expensesToCsv, parseCsvLine, toCsvLine } from '../src/csv/csv.js';
import { readExpensesCsv } from '../src/csv/read-expenses.js';

describe('parseCsvLine / toCsvLine', () => {
  it('respeta las comillas y las comillas escapadas', () => {
    assert.deepEqual(parseCsvLine('a,"b, c",d'), ['a', 'b, c', 'd']);
    assert.deepEqual(parseCsvLine('"dijo ""hola""",x'), ['dijo "hola"', 'x']);
    assert.deepEqual(parseCsvLine('a,,'), ['a', '', '']);
  });

  it('entrecomilla solo cuando hace falta', () => {
    assert.equal(toCsvLine(['a', 'b, c', 'dijo "hola"']), 'a,"b, c","dijo ""hola"""\n');
  });
});

describe('csvParser', () => {
  it('reconstruye líneas y caracteres partidos entre chunks', async () => {
    const bytes = Buffer.from('fecha,importe,categoria,descripcion\r\n2026-11-01,12.5,comida,Piña\n');
    const cut = bytes.indexOf('ñ') + 1; // cortamos a mitad de la «ñ» (2 bytes en UTF-8)
    const chunks = [bytes.subarray(0, 10), bytes.subarray(10, cut), bytes.subarray(cut)];

    const rows = await Readable.from(chunks).pipe(csvParser()).toArray();
    assert.deepEqual(rows, [
      { line: 2, record: { fecha: '2026-11-01', importe: '12.5', categoria: 'comida', descripcion: 'Piña' } },
    ]);
  });
});

describe('expensesToCsv', () => {
  it('escribe la cabecera y una línea por gasto', async () => {
    let output = '';
    await pipeline(
      Readable.from([{ date: '2026-11-01', amount: 1250, category: 'comida', description: 'Pan, leche' }]),
      expensesToCsv(),
      async function (source) {
        for await (const chunk of source) output += chunk;
      },
    );
    assert.equal(output, 'fecha,importe,categoria,descripcion\n2026-11-01,12.50,comida,"Pan, leche"\n');
  });
});

describe('readExpensesCsv', () => {
  it('separa filas válidas y errores con su número de línea', async () => {
    const csv = 'fecha,importe,categoria,descripcion\n2026-11-01,12.5,comida,Pan\n2026-11-02,abc,comida,Mal\n';
    const { valid, errors } = await readExpensesCsv(Readable.from([csv]));
    assert.equal(valid.length, 1);
    assert.equal(valid[0].amount, 1250);
    assert.equal(errors.length, 1);
    assert.equal(errors[0].field, 'línea 3');
  });
});
