import { clsx } from 'clsx';
import type { AdminStats, EstadoFilter } from '@/utils/adminFilters';

interface Props {
  stats: AdminStats;
  active: EstadoFilter;
  onChange: (estado: EstadoFilter) => void;
}

const CARDS: { key: EstadoFilter; label: string; accent: string }[] = [
  { key: 'todos', label: 'Total', accent: 'text-text' },
  { key: 'constock', label: 'Con stock', accent: 'text-wa' },
  { key: 'sinstock', label: 'Sin stock', accent: 'text-danger' },
  { key: 'inactivo', label: 'Inactivos', accent: 'text-muted' },
];

export default function AdminStatsBar({ stats, active, onChange }: Props) {
  const numbers: Record<EstadoFilter, number> = {
    todos: stats.total,
    constock: stats.conStock,
    sinstock: stats.sinStock,
    inactivo: stats.inactivos,
  };

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-3">
      {CARDS.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => onChange(c.key)}
          className={clsx(
            'rounded-xl border bg-panel px-2 py-3 text-center transition',
            active === c.key ? 'border-gold' : 'border-border hover:border-gold/50',
          )}
        >
          <div className={clsx('font-heading text-xl font-bold md:text-2xl', c.accent)}>
            {numbers[c.key]}
          </div>
          <div className="mt-0.5 text-[11px] leading-tight text-muted md:text-xs">{c.label}</div>
        </button>
      ))}
    </div>
  );
}
