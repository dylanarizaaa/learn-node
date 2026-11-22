'use client';

import Link from 'next/link';
import { Circle, CircleCheck, Flag } from 'lucide-react';
import type { Milestone } from '@/lib/content/types';
import { useHydrated, useLearningStore } from '@/lib/store/learning-store';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/learning/section-progress';

export interface RoadmapMilestone extends Milestone {
  lessons: { id: string; title: string; url: string; section: string }[];
}

/** Hoja de ruta del proyecto con el progreso de cada hito (guardado en el navegador). */
export function RoadmapClient({ milestones }: { milestones: RoadmapMilestone[] }) {
  const hydrated = useHydrated();
  const completed = useLearningStore((s) => s.completed);
  const isDone = (id: string) => hydrated && completed.includes(id);

  return (
    <ol data-reset className="not-prose relative ml-4 border-l border-border">
      {milestones.map((m) => {
        const done = m.lessons.filter((l) => isDone(l.id)).length;
        const finished = m.lessons.length > 0 && done === m.lessons.length;
        return (
          <li key={m.number} id={`hito-${m.number}`} className="relative scroll-mt-24 pb-8 pl-8 last:pb-0">
            <span
              aria-hidden
              className={cn(
                'absolute top-0 -left-[0.95rem] flex size-[1.85rem] items-center justify-center rounded-full border font-mono text-xs font-semibold',
                finished ? 'border-success/50 bg-success text-background' : 'border-brand/40 bg-card text-foreground',
              )}
            >
              {m.number}
            </span>
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-base font-semibold">{m.title}</p>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {done}/{m.lessons.length} lecciones
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
              <p className="mt-2.5 flex items-start gap-2 text-sm">
                <Flag className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                <span>
                  <span className="font-medium">Al terminar: </span>
                  {m.outcome}
                </span>
              </p>
              <ProgressBar ratio={m.lessons.length ? done / m.lessons.length : 0} className="mt-3" />
              <ul data-reset className="mt-3 grid grid-cols-1 gap-x-4 gap-y-0.5 sm:grid-cols-2">
                {m.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      href={lesson.url}
                      data-card
                      className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-muted/60"
                    >
                      {isDone(lesson.id) ? (
                        <CircleCheck className="size-3.5 shrink-0 text-success" aria-label="Completada" />
                      ) : (
                        <Circle className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden />
                      )}
                      <span className={cn('truncate', isDone(lesson.id) && 'text-muted-foreground')}>{lesson.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
