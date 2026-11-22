import Link from 'next/link';
import { LogoMark } from './logo';

const COLUMNS = [
  {
    title: 'Aprender',
    links: [
      { href: '/docs/introduccion/que-es-node', label: 'Empezar desde cero' },
      { href: '/rutas', label: 'Rutas de aprendizaje' },
      { href: '/docs/monedero/hoja-de-ruta', label: 'Proyecto Monedero' },
      { href: '/proyectos', label: 'Proyectos prácticos' },
    ],
  },
  {
    title: 'Referencia',
    links: [
      { href: '/docs', label: 'Toda la documentación' },
      { href: '/glosario', label: 'Glosario técnico' },
      { href: '/docs/introduccion/mapa-del-ecosistema', label: 'Mapa del ecosistema' },
      { href: '/mi-aprendizaje', label: 'Mi aprendizaje' },
    ],
  },
  {
    title: 'Fuentes oficiales',
    links: [
      { href: 'https://nodejs.org/docs/latest/api/', label: 'Node.js API' },
      { href: 'https://nodejs.org/en/learn', label: 'Aprende Node.js' },
      { href: 'https://expressjs.com/', label: 'Express' },
      { href: 'https://developer.mozilla.org/es/docs/Web/JavaScript', label: 'JavaScript en MDN' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-[90rem] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 font-semibold">
            <LogoMark className="size-6" /> Nodo
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Documentación interactiva en español para aprender Node.js con lecciones cortas que construyen, paso a paso, un proyecto real.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Contenido revisado con Node.js 26 LTS · Express 5 · Zod 4 (noviembre de 2026).
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="text-sm font-semibold">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith('http') ? (
                    <a href={link.href} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
