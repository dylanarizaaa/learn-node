import { highlight } from '@/lib/mdx/highlight';

const HERO_CODE = `import { Router } from 'express';
import { parse } from '../lib/validation.js';
import { createExpenseSchema } from './expenses.schema.js';

export function expensesRouter({ expenses }) {
  const router = Router();

  router.post('/', (req, res) => {
    const data = parse(createExpenseSchema, req.body);
    res.status(201).json(expenses.create(req.user.id, data));
  });

  router.get('/summary', (req, res) => {
    res.json(expenses.summary(req.user.id, req.query.month));
  });

  return router;
}`;

const TERMINAL = [
  { type: 'cmd', text: 'curl -X POST localhost:3000/api/expenses \\' },
  { type: 'cont', text: '  -H "authorization: Bearer $TOKEN" \\' },
  { type: 'cont', text: `  -d '{"amount":"12,50","category":"comida"}'` },
  { type: 'out', text: '{"id":1,"amount":1250,"category":"comida",' },
  { type: 'out', text: ' "date":"2026-11-22"}' },
  { type: 'cmd', text: 'npm test' },
  { type: 'ok', text: '✔ API: gastos (4 tests)' },
  { type: 'ok', text: '✔ API: CSV, informes y eventos (4 tests)' },
  { type: 'out', text: 'ℹ tests 37  pass 37  fail 0' },
] as const;

/** Código real del proyecto Monedero y una terminal con lo que produce. */
export async function HeroShowcase() {
  const html = await highlight(HERO_CODE, 'js');
  return (
    <div className="relative flex flex-col items-center gap-6 lg:block">
      <div className="w-full overflow-hidden rounded-2xl border border-border bg-code shadow-xl shadow-black/5 lg:mr-28 lg:w-auto">
        <div className="flex h-10 items-center gap-2 border-b border-border bg-code-header px-4">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/15" />
          </span>
          <span className="ml-2 font-mono text-xs text-muted-foreground">proyecto/src/expenses/expenses.routes.js</span>
        </div>
        <div
          className="code-body thin-scrollbar max-h-[25rem] overflow-auto text-[0.78rem]"
          data-line-numbers="true"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 font-mono text-[11.5px] leading-relaxed text-zinc-300 shadow-2xl lg:absolute lg:top-40 lg:-right-6 lg:w-[23rem]"
        role="img"
        aria-label="Terminal: una petición a la API de Monedero con curl y la salida de los tests"
      >
        <div className="flex h-8 items-center gap-2 border-b border-white/10 px-3 text-[10.5px] text-zinc-500">
          <span className="size-2 rounded-full bg-emerald-400" aria-hidden />
          monedero — zsh
        </div>
        <div className="space-y-0.5 p-3.5">
          {TERMINAL.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-all">
              {line.type === 'cmd' && <span className="text-emerald-400">$ </span>}
              <span
                className={
                  line.type === 'cmd' || line.type === 'cont'
                    ? 'text-zinc-100'
                    : line.type === 'ok'
                      ? 'text-emerald-400'
                      : 'text-zinc-400'
                }
              >
                {line.text}
              </span>
            </div>
          ))}
          <div className="text-emerald-400">
            $ <span className="inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-zinc-300" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
