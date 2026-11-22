import Link from 'next/link';
import {
  ArrowRight,
  BookA,
  BookMarked,
  FileCode2,
  FlaskConical,
  Route,
  Search,
  SquareTerminal,
  Wallet,
  Workflow,
} from 'lucide-react';
import { learningPaths } from '@/content/learning-paths';
import { glossary } from '@/content/glossary';
import { milestones } from '@/content/project';
import { technologies } from '@/content/technologies';
import { SectionIconView } from '@/components/docs/section-icon';
import { HeroShowcase } from '@/components/home/hero-showcase';
import { ProjectCard } from '@/components/learning/projects-grid';
import { SearchTrigger } from '@/components/search/search-dialog';
import { getAllMeta, getNavigation, getSectionDocs } from '@/lib/content/docs';
import { DIFFICULTY_LABEL, formatMinutes } from '@/lib/utils';

const BENEFITS = [
  {
    icon: Workflow,
    title: 'Lecciones cortas',
    text: 'Un concepto por página: qué es, para qué sirve, un ejemplo mínimo y los errores habituales. Sin relleno.',
  },
  {
    icon: Wallet,
    title: 'Todo se aplica a un proyecto',
    text: 'Cada lección termina con un bloque «Monedero» que añade lo aprendido al proyecto guía, hito a hito.',
  },
  {
    icon: FlaskConical,
    title: 'Código probado',
    text: 'El proyecto final está en el repositorio con 37 tests. Los fragmentos marcados como reales se leen del código al compilar.',
  },
  {
    icon: FileCode2,
    title: 'Node.js moderno',
    text: 'Node 26 LTS, módulos ES, node:test, node:sqlite, fetch, --watch y --env-file: lo que hoy viene incluido, sin dependencias de más.',
  },
  {
    icon: Search,
    title: 'Buscador instantáneo',
    text: 'Encuentra temas, secciones, APIs y términos del glosario con ⌘K o /. La búsqueda se ejecuta en tu navegador.',
  },
  {
    icon: BookMarked,
    title: 'Progreso por hitos',
    text: 'Marca lecciones como completadas y sigue el avance de cada hito del proyecto. Se guarda solo en tu navegador.',
  },
];

const FEATURED_PROJECTS = [
  'proyectos/cli-de-notas',
  'proyectos/acortador-de-urls',
  'proyectos/monitor-de-sitios',
  'proyectos/chat-en-tiempo-real',
  'proyectos/cola-de-trabajos',
  'proyectos/organizador-de-archivos',
];

export default function HomePage() {
  const navigation = getNavigation();
  const all = getAllMeta();
  const docsCount = all.filter((m) => m.kind === 'doc').length;
  const projects = getSectionDocs('proyectos');
  const featured = FEATURED_PROJECTS.map((id) => projects.find((p) => p.id === id)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );
  const lessonsByMilestone = (n: number) => all.filter((m) => m.milestone === n).length;

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)] bg-[size:44px_44px] opacity-60"
        />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 pt-14 pb-16 sm:px-6 sm:pt-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-10 lg:pb-24">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              Actualizado para Node.js 26 LTS · Express 5
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              Aprende Node.js construyendo un proyecto real.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
              Lecciones cortas, de principiante a avanzado. Cada una explica un concepto y lo aplica a Monedero, una API de gastos
              que crece contigo hasta estar lista para producción.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/docs/introduccion/que-es-node"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Comenzar a aprender <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/docs/monedero/hoja-de-ruta"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Wallet className="size-4" /> Ver el proyecto
              </Link>
            </div>
            <SearchTrigger className="mt-6 h-11 w-full max-w-md rounded-xl" />
          </div>
          <HeroShowcase />
        </div>
      </section>

      {/* Cifras reales del contenido */}
      <section className="border-b border-border">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 md:grid-cols-4">
          {[
            { value: docsCount, label: 'lecciones' },
            { value: milestones.length, label: 'hitos del proyecto guía' },
            { value: projects.length, label: 'proyectos extra' },
            { value: glossary.length, label: 'términos en el glosario' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`py-7 ${i > 0 ? 'md:border-l md:border-border md:pl-8' : ''} ${i % 2 === 1 ? 'border-l border-border pl-6 md:pl-8' : ''}`}
            >
              <dt className="text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Proyecto guía */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid grid-cols-1 gap-10 overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">Proyecto guía</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Monedero: de un script a producción</h2>
            <p className="mt-3 text-muted-foreground">
              Empiezas con una función que convierte «12,50» en céntimos. Terminas con una API con usuarios, base de datos,
              tests, tiempo real, workers, cluster y Docker. Nada de proyectos sueltos: cada lección añade una pieza al mismo
              código, y el resultado final está en el repositorio, probado.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/docs/introduccion/el-proyecto-de-la-guia"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
              >
                Cómo funciona la guía <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/docs/monedero/referencia-de-la-api"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted"
              >
                Referencia de la API
              </Link>
            </div>
          </div>
          <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label="Hitos del proyecto">
            {milestones.map((m) => (
              <li key={m.number}>
                <Link
                  href={`/docs/monedero/hoja-de-ruta#hito-${m.number}`}
                  className="flex h-full items-start gap-3 rounded-xl border border-border bg-background p-3.5 transition-colors hover:border-brand/40"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs font-semibold">
                    {m.number}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{m.title}</span>
                    <span className="block text-xs text-muted-foreground">{lessonsByMilestone(m.number)} lecciones</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Rutas de aprendizaje */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <SectionTitle
          eyebrow="Rutas de aprendizaje"
          title="Un camino claro, de cero a producción"
          text="Secuencias de lecciones y proyectos pensadas para avanzar sin lagunas. Elige tu punto de partida."
          href="/rutas"
          cta="Ver todas las rutas"
        />
        <ol className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {learningPaths.slice(0, 8).map((path, i) => (
            <li key={path.slug}>
              <Link
                href={`/rutas#${path.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">{String(i + 1).padStart(2, '0')}</span>
                  <span>{DIFFICULTY_LABEL[path.level]}</span>
                </div>
                <h3 className="mt-3 font-semibold">{path.title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{path.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Route className="size-3.5" aria-hidden /> {path.steps.length} pasos
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Categorías */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionTitle
            eyebrow="Categorías"
            title="Todo Node.js, organizado"
            text="Del JavaScript imprescindible a desplegar en producción: cada categoría avanza de lo esencial a lo avanzado."
            href="/docs"
            cta="Ver índice completo"
          />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {navigation.map((section) => {
              const items = section.groups.flatMap((g) => g.items);
              return (
                <Link
                  key={section.slug}
                  href={`/docs/${section.slug}`}
                  className="group flex gap-4 rounded-2xl border border-border bg-background p-5 transition-colors hover:border-brand/40"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card">
                    <SectionIconView icon={section.icon} className="size-5 text-brand" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-semibold">
                      {section.title}
                      {section.badge && (
                        <span className="rounded-full bg-brand-soft px-1.5 py-px text-[10px] font-semibold text-brand">
                          {section.badge}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">{section.description}</span>
                    <span className="mt-2 block text-xs text-muted-foreground">
                      {items.length} {section.kind === 'project' ? 'proyectos' : 'temas'} ·{' '}
                      {formatMinutes(items.reduce((a, i) => a + i.time, 0))}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Proyectos destacados */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionTitle
          eyebrow="Proyectos prácticos"
          title="Más allá de Monedero"
          text="Proyectos independientes para practicar por tu cuenta: de una CLI de notas a una cola de trabajos con workers."
          href="/proyectos"
          cta={`Ver los ${projects.length} proyectos`}
        />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProjectCard
              key={p.id}
              project={{
                id: p.id,
                title: p.title,
                description: p.description,
                url: p.url,
                difficulty: p.difficulty,
                time: p.time,
                technologies: p.technologies ?? [],
              }}
            />
          ))}
        </div>
      </section>

      {/* Tecnologías */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionTitle
            eyebrow="Tecnologías"
            title="Qué aprenderás y cuándo usar cada herramienta"
            text="Primero lo que trae Node de serie; después, las librerías que de verdad aportan algo y en qué momento incorporarlas."
            href="/docs/introduccion/mapa-del-ecosistema"
            cta="Ver el mapa del ecosistema"
          />
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {technologies.map((tech) => (
              <Link
                key={tech.name}
                href={tech.href}
                className="rounded-2xl border border-border bg-background p-5 transition-colors hover:border-brand/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{tech.name}</span>
                  {tech.version && (
                    <span className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {tech.version}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs font-medium text-brand">{tech.role}</div>
                <p className="mt-2 text-sm text-muted-foreground">{tech.when}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionTitle
          eyebrow="Por qué Nodo"
          title="Explicaciones pequeñas, un proyecto que crece"
          text="Aprender piezas sueltas no basta: lo difícil es saber dónde encaja cada una. Aquí cada pieza encaja en el mismo proyecto."
        />
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-card">
                <Icon className="size-5 text-brand" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-foreground p-8 text-background sm:p-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
              <SquareTerminal className="size-7" aria-hidden /> Tu primer programa está a una lección
            </h2>
            <p className="mt-2 max-w-xl text-background/70">
              Empieza por la introducción o salta directamente a la ruta que mejor encaje con tu experiencia.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs/introduccion/que-es-node"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-background px-5 text-sm font-medium text-foreground hover:opacity-90"
            >
              Comenzar ahora <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/glosario"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-background/25 px-5 text-sm font-medium hover:bg-background/10"
            >
              <BookA className="size-4" /> Glosario
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionTitle({
  eyebrow,
  title,
  text,
  href,
  cta,
}: {
  eyebrow: string;
  title: string;
  text: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-brand">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance">{title}</h2>
        <p className="mt-3 text-muted-foreground">{text}</p>
      </div>
      {href && cta && (
        <Link href={href} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium hover:text-brand">
          {cta} <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
