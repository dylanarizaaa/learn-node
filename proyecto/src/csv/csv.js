import { Transform } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';

/** Columnas del CSV de Monedero (en el orden en que se exportan). */
export const CSV_COLUMNS = ['fecha', 'importe', 'categoria', 'descripcion'];

const MAX_LINE_LENGTH = 10_000;

/**
 * Separa una línea CSV en campos respetando las comillas:
 * 'a,"b, c",d' → ['a', 'b, c', 'd'].  Dos comillas seguidas ("") son una comilla literal.
 *
 * @param {string} line
 */
export function parseCsvLine(line) {
  const fields = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      fields.push(field);
      field = '';
    } else {
      field += char;
    }
  }
  fields.push(field);
  return fields;
}

/**
 * Convierte una lista de valores en una línea CSV, entrecomillando lo necesario.
 *
 * @param {unknown[]} values
 */
export function toCsvLine(values) {
  const fields = values.map((value) => {
    const text = String(value ?? '');
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  });
  return `${fields.join(',')}\n`;
}

/**
 * Transform stream que recibe bytes y emite un objeto por fila: { line, record }.
 * La primera línea se usa como cabecera. Funciona con archivos de cualquier tamaño
 * porque solo guarda en memoria la línea que aún no ha terminado de llegar.
 */
export function csvParser() {
  const decoder = new StringDecoder('utf8'); // no rompe caracteres como «ñ» partidos entre dos chunks
  let pending = '';
  let header = null;
  let lineNumber = 0;

  /** @this {Transform} */
  function processLine(line) {
    lineNumber++;
    const clean = line.replace(/\r$/, '').replace(/^﻿/, ''); // fin de línea de Windows y BOM
    if (clean.trim() === '') return;
    const values = parseCsvLine(clean);
    if (!header) {
      header = values.map((name) => name.trim().toLowerCase());
      return;
    }
    const record = Object.fromEntries(header.map((key, i) => [key, values[i]?.trim() ?? '']));
    this.push({ line: lineNumber, record });
  }

  return new Transform({
    readableObjectMode: true, // entra texto, salen objetos
    transform(chunk, _encoding, callback) {
      pending += decoder.write(chunk);
      const lines = pending.split('\n');
      pending = lines.pop() ?? ''; // la última línea puede estar incompleta
      if (pending.length > MAX_LINE_LENGTH) {
        callback(new RangeError(`Línea ${lineNumber + lines.length + 1} demasiado larga`));
        return;
      }
      for (const line of lines) processLine.call(this, line);
      callback();
    },
    flush(callback) {
      pending += decoder.end();
      if (pending) processLine.call(this, pending);
      callback();
    },
  });
}

/** Transform stream que recibe gastos (objetos) y emite líneas CSV, cabecera incluida. */
export function expensesToCsv() {
  let headerSent = false;
  return new Transform({
    writableObjectMode: true, // entran objetos, sale texto
    transform(expense, _encoding, callback) {
      if (!headerSent) {
        this.push(toCsvLine(CSV_COLUMNS));
        headerSent = true;
      }
      const { date, amount, category, description } = expense;
      callback(null, toCsvLine([date, (amount / 100).toFixed(2), category, description]));
    },
    flush(callback) {
      if (!headerSent) this.push(toCsvLine(CSV_COLUMNS)); // CSV vacío: solo la cabecera
      callback();
    },
  });
}
