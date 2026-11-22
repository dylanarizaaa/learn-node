import { Braces, Compass, Cpu, Database, FlaskConical, Globe, Hammer, Blocks, Rocket, Route, Shield, Wallet } from 'lucide-react';
import type { SectionIcon } from '@/lib/content/types';

const ICONS = {
  compass: Compass,
  braces: Braces,
  blocks: Blocks,
  globe: Globe,
  route: Route,
  database: Database,
  shield: Shield,
  flask: FlaskConical,
  cpu: Cpu,
  rocket: Rocket,
  wallet: Wallet,
  hammer: Hammer,
} satisfies Record<SectionIcon, unknown>;

export function SectionIconView({ icon, className }: { icon: SectionIcon; className?: string }) {
  const Icon = ICONS[icon];
  return <Icon className={className} aria-hidden />;
}
