import { clsx } from 'clsx';
import { Search } from 'lucide-react';
import type { MlFilter } from '@/utils/adminFilters';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  showMlFilter: boolean;
  mlFilter: MlFilter;
  onMlFilterChange: (value: MlFilter) => void;
  onSelectAllVisible: () => void;
  onSelectDiscounted: () => void;
  onClearSelection: () => void;
}

const ML_OPTIONS: { key: MlFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: '5', label: '5ml' },
  { key: '10', label: '10ml' },
];

export default function AdminFilters({
  search,
  onSearchChange,
  showMlFilter,
  mlFilter,
  onMlFilterChange,
  onSelectAllVisible,
  onSelectDiscounted,
  onClearSelection,
}: Props) {
  return (
    <div className="mt-3 flex flex-col gap-2.5">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nombre o marca..."
          className="w-full rounded-xl border border-border bg-panel py-3 pl-9 pr-3 text-sm text-text outline-none focus:border-gold"
        />
      </div>

      {showMlFilter && (
        <div className="flex flex-wrap gap-1.5">
          {ML_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => onMlFilterChange(opt.key)}
              className={clsx(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                mlFilter === opt.key
                  ? 'border-gold text-gold'
                  : 'border-border text-muted hover:border-gold/50',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={onSelectAllVisible}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-gold hover:text-gold"
        >
          ☑️ Todos
        </button>
        <button
          type="button"
          onClick={onSelectDiscounted}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-gold hover:text-gold"
        >
          🏷️ Con descuento
        </button>
        <button
          type="button"
          onClick={onClearSelection}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-danger hover:text-danger"
        >
          ✕ Limpiar
        </button>
      </div>
    </div>
  );
}
