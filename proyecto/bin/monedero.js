#!/usr/bin/env node
// CLI de Monedero: trabaja directamente con la base de datos, reutilizando
// los mismos servicios que la API. Ejemplos:
//
//   node bin/monedero.js add 12,50 comida "Almuerzo" --user ana@example.com
//   node bin/monedero.js summary --month 2026-11
//   node bin/monedero.js export > noviembre.csv
import { EventEmitter } from 'node:events';
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { parseArgs, styleText } from 'node:util';
import { expensesToCsv } from '../src/csv/csv.js';
import { readExpensesCsv } from '../src/csv/read-expenses.js';
import { openDatabase } from '../src/db/database.js';
import { migrate } from '../src/db/migrate.js';
import { CATEGORIES } from '../src/domain/expenses.js';
import { createExpensesRepository } from '../src/expenses/expenses.repository.js';
import { createExpenseSchema, listExpensesSchema, summarySchema } from '../src/expenses/expenses.schema.js';
import { createExpensesService } from '../src/expenses/expenses.service.js';
import { formatCents } from '../src/lib/money.js';
import { parse } from '../src/lib/validation.js';
import { createUsersRepository } from '../src/users/users.repository.js';

const HELP = `
Uso: monedero <comando> [opciones]

Comandos:
  add <importe> <categoría> [descripción]   Registra un gasto
  list                                      Lista los gastos (--month, --category)
  summary                                   Total del mes por categoría (--month)
  import <archivo.csv>                      Importa gastos desde un CSV ("-" para stdin)
  export                                    Escribe los gastos del mes en CSV (--month)

Opciones:
  -u, --user <email>     Usuario (por defecto, la variable MONEDERO_USER)
  -m, --month <AAAA-MM>  Mes (por defecto, el actual)
  -c, --category <cat>   Categoría: ${CATEGORIES.join(', ')}
  -d, --date <AAAA-MM-DD> Fecha del gasto al usar "add"
  -h, --help             Muestra esta ayuda
`;

let values;
let positionals;
try {
  ({ values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      user: { type: 'string', short: 'u', default: process.env.MONEDERO_USER },
      month: { type: 'string', short: 'm' },
      category: { type: 'string', short: 'c' },
      date: { type: 'string', short: 'd' },
      help: { type: 'boolean', short: 'h', default: false },
    },
  }));
} catch (error) {
  // Opción desconocida o mal escrita: es un error de uso (código de salida 2).
  console.error(styleText('red', `✖ ${error.message}`));
  process.exit(2);
}

const [command, ...args] = positionals;
const money = (cents) => formatCents(cents, { currency: process.env.CURRENCY ?? 'USD' });

if (values.help || !command) {
  console.log(HELP);
  process.exit(values.help ? 0 : 2); // 2: uso incorrecto
}

const db = openDatabase(process.env.DATABASE_PATH ?? 'data/monedero.db');

try {
  migrate(db);
  await run();
} catch (error) {
  console.error(styleText('red', `✖ ${error.message}`));
  for (const detail of error.details ?? []) {
    console.error(styleText('red', `  - ${detail.field ?? ''} ${detail.message}`));
  }
  process.exitCode = 1;
} finally {
  db.close();
}

async function run() {
  const user = findUser();
  const expenses = createExpensesService({ repository: createExpensesRepository(db), events: new EventEmitter() });

  switch (command) {
    case 'add': {
      const [amount, category, ...description] = args;
      const data = parse(createExpenseSchema, { amount, category, description: description.join(' '), date: values.date });
      const expense = expenses.create(user.id, data);
      console.log(styleText('green', `✔ Gasto #${expense.id}: ${money(expense.amount)} en ${expense.category}`));
      break;
    }
    case 'list': {
      const query = parse(listExpensesSchema, { month: values.month, category: values.category, limit: 100 });
      const { items, total } = expenses.list(user.id, query);
      for (const e of items) {
        const amount = money(e.amount).padStart(12);
        console.log(`${styleText('dim', e.date)}  ${e.category.padEnd(11)} ${amount}  ${e.description}`);
      }
      console.log(styleText('dim', `${items.length} de ${total} gastos`));
      break;
    }
    case 'summary': {
      const { month } = parse(summarySchema, { month: values.month });
      const summary = expenses.summary(user.id, month);
      console.log(styleText('bold', `Resumen de ${summary.month}: ${money(summary.total)} en ${summary.count} gastos\n`));
      for (const [category, cents] of Object.entries(summary.byCategory)) {
        const share = summary.total > 0 ? cents / summary.total : 0;
        const bar = '█'.repeat(Math.round(share * 30));
        console.log(`${category.padEnd(11)} ${money(cents).padStart(12)}  ${styleText('cyan', bar)}`);
      }
      break;
    }
    case 'import': {
      const [file] = args;
      if (!file) throw new Error('Indica el archivo: monedero import gastos.csv');
      const source = file === '-' ? process.stdin : createReadStream(file);
      const { valid, errors } = await readExpensesCsv(source);
      if (errors.length > 0) {
        const error = new Error(`Hay ${errors.length} filas con errores; no se importó nada`);
        throw Object.assign(error, { details: errors.slice(0, 20) });
      }
      const created = expenses.importMany(user.id, valid);
      console.log(styleText('green', `✔ ${created.length} gastos importados`));
      break;
    }
    case 'export': {
      const { month } = parse(summarySchema, { month: values.month });
      await pipeline(Readable.from(expenses.iterateMonth(user.id, month)), expensesToCsv(), process.stdout);
      break;
    }
    default:
      throw new Error(`Comando desconocido: "${command}". Usa --help para ver los comandos.`);
  }
}

function findUser() {
  if (!values.user) {
    throw new Error('Indica el usuario con --user <email> o la variable de entorno MONEDERO_USER');
  }
  const user = createUsersRepository(db).findByEmail(values.user.toLowerCase());
  if (!user) {
    throw new Error(`No existe el usuario ${values.user}. Regístralo con POST /api/auth/register.`);
  }
  return user;
}
