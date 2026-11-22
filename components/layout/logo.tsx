import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Un pequeño grafo: tres nodos conectados a uno central. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn('size-7', className)}>
      <rect x="1" y="1" width="30" height="30" rx="8" className="fill-foreground" />
      <path d="M10 11 16 17 22 11M16 17v7" className="fill-none stroke-background" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10" cy="11" r="2.4" className="fill-background" />
      <circle cx="22" cy="11" r="2.4" className="fill-background" />
      <circle cx="16" cy="24" r="2.4" className="fill-background" />
      <circle cx="16" cy="17" r="3.1" className="fill-brand" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2 font-semibold tracking-tight', className)} aria-label="Nodo, ir al inicio">
      <LogoMark />
      <span className="text-[0.95rem]">
        Nodo<span className="font-normal text-muted-foreground"> / Node.js</span>
      </span>
    </Link>
  );
}
