import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { FileCode2, Lock, Wallet } from 'lucide-react';
import { getMilestone, milestones, project } from '@/content/project';
import { getAllMeta } from '@/lib/content/docs';
import { cn } from '@/lib/utils';
import { CodeBlock } from './code-block';
import { RoadmapClient, type RoadmapMilestone } from './roadmap-client';

const PROJECT_DIR = path.join(process.cwd(), project.folder);

/* ---------------- ProjectStep: «Aplícalo al proyecto» ---------------- */

/**
 * Bloque que aplica la lección al proyecto guía. El número de hito se toma del
 * frontmatter de la página (`milestone`), así que en MDX basta con:
 *
 *   <ProjectStep files={['src/lib/money.js']}> … </ProjectStep>
 */
export function ProjectStep({
  milestone,
  files,
  children,
}: {
  milestone?: number;
  files?: string[];
  children: ReactNode;
}) {
  const m = getMilestone(milestone);
  return (
    <section className="not-prose overflow-hidden rounded-2xl border border-brand/30" aria-label={`Aplicación al proyecto ${project.name}`}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-brand/20 bg-brand-soft/70 px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-6 items-center justify-center rounded-md bg-brand text-brand-foreground">
            <Wallet className="size-3.5" aria-hidden />
          </span>
          {project.name}
        </span>
        {m && (
          <Link
            href={`${project.roadmapUrl}#hito-${m.number}`}
            data-card
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Hito {m.number} de {milestones.length} · {m.title}
          </Link>
        )}
      </header>
      {files && files.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-card px-4 py-2">
          <span className="text-xs text-muted-foreground">Archivos:</span>
          {files.map((file) => (
            <span
              key={file}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[0.72rem]"
            >
              <FileCode2 className="size-3 text-muted-foreground" aria-hidden />
              {file}
            </span>
          ))}
        </div>
      )}
      <div className="doc-content bg-card px-4 py-4 sm:px-5 [&>*+*]:mt-4">{children}</div>
    </section>
  );
}

/* ---------------- SourceFile: código real del proyecto ---------------- */

const EXTENSION_LANG: Record<string, string> = {
  '.js': 'js',
  '.mjs': 'js',
  '.json': 'json',
  '.sql': 'sql',
  '.html': 'html',
  '.css': 'css',
  '.md': 'md',
  '.yml': 'yaml',
  '.yaml': 'yaml',
};

function langFor(file: string) {
  const base = path.basename(file);
  if (base === 'Dockerfile') return 'dockerfile';
  if (base.startsWith('.env')) return 'dotenv';
  if (base.startsWith('.')) return 'text';
  return EXTENSION_LANG[path.extname(file)] ?? 'text';
}

/**
 * Muestra un archivo (o un rango de líneas) del proyecto final, leído en el
 * momento de compilar: el código de la documentación y el del repositorio
 * nunca se desincronizan.
 */
export function SourceFile({ path: file, lines, title }: { path: string; lines?: string; title?: string }) {
  const absolute = path.join(PROJECT_DIR, file);
  if (!absolute.startsWith(PROJECT_DIR) || !fs.existsSync(absolute)) {
    throw new Error(`[SourceFile] No existe ${project.folder}/${file}`);
  }
  let code = fs.readFileSync(absolute, 'utf8');
  if (lines) {
    const [from, to] = lines.split('-').map(Number);
    code = code
      .split('\n')
      .slice(from - 1, to || from)
      .join('\n');
  }
  return <CodeBlock code={code} lang={langFor(file)} title={title ?? `${project.folder}/${file}`} />;
}

/* ---------------- Endpoint: referencia de la API ---------------- */

const METHOD_STYLE: Record<string, string> = {
  GET: 'text-success border-success/30 bg-success/[0.07]',
  POST: 'text-brand border-brand/30 bg-brand-soft',
  PATCH: 'text-warning border-warning/40 bg-warning/[0.08]',
  PUT: 'text-warning border-warning/40 bg-warning/[0.08]',
  DELETE: 'text-danger border-danger/30 bg-danger/[0.07]',
};

export function Endpoints({ children }: { children: ReactNode }) {
  return <div className="not-prose divide-y divide-border overflow-hidden rounded-xl border border-border">{children}</div>;
}

export function Endpoint({
  method,
  path: route,
  auth = false,
  children,
}: {
  method: string;
  path: string;
  auth?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 bg-card px-4 py-3 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex shrink-0 items-center gap-2 sm:w-80">
        <span
          className={cn(
            'w-16 rounded-md border px-1.5 py-0.5 text-center font-mono text-[0.7rem] font-semibold',
            METHOD_STYLE[method] ?? 'border-border',
          )}
        >
          {method}
        </span>
        <code className="min-w-0 font-mono text-[0.8rem] break-all">{route}</code>
        {auth && <Lock className="size-3.5 shrink-0 text-muted-foreground" aria-label="Requiere token" />}
      </div>
      {children && <div className="text-sm leading-relaxed text-muted-foreground [&_code]:text-foreground">{children}</div>}
    </div>
  );
}

/* ---------------- Roadmap: los hitos con sus lecciones ---------------- */

export function Roadmap() {
  const metas = getAllMeta();
  const data: RoadmapMilestone[] = milestones.map((m) => ({
    ...m,
    lessons: metas
      .filter((meta) => meta.milestone === m.number)
      .map((meta) => ({ id: meta.id, title: meta.title, url: meta.url, section: meta.sectionTitle })),
  }));
  return <RoadmapClient milestones={data} />;
}
