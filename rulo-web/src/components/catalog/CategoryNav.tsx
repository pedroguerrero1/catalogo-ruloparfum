import { useState } from 'react';
import clsx from 'clsx';
import {
  CloudFog,
  Droplet,
  Droplets,
  FlaskConical,
  Gift,
  Sparkles,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { useCategorySections } from '@/hooks/useCategorySections';

const CATEGORY_ICON: Record<string, LucideIcon> = {
  '#perfumes': Sparkles,
  '#decants': FlaskConical,
  '#promos': Gift,
  '#desodorantes': Wind,
  '#bodysplash': Droplets,
  '#cremas': Droplet,
  '#vapers': CloudFog,
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

interface CategoryNavProps {
  /** section id ('perfumes', 'decants', ...) -> whether it currently has visible products */
  availability?: Record<string, boolean>;
}

export function CategoryNav({ availability }: CategoryNavProps) {
  const { data: sections } = useCategorySections();
  const [decantOpen, setDecantOpen] = useState(false);

  if (!sections || sections.length === 0) return null;

  return (
    <section className="py-2">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
        {sections.map((s) => {
          const Icon = CATEGORY_ICON[s.link] ?? Sparkles;
          const isDecants = s.link === '#decants';
          const sectionId = s.link.replace('#', '');
          const available = availability?.[sectionId] ?? true;

          const card = (
            <div
              className={clsx(
                'group flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-2 transition-all duration-300',
                available
                  ? 'hover:-translate-y-1 hover:border-gold/70 hover:bg-gold-bg hover:shadow-lg hover:shadow-gold/10'
                  : 'opacity-40',
              )}
            >
              <div
                className={clsx(
                  'flex h-10 w-10 items-center justify-center rounded-full bg-gold-bg transition-colors duration-300 sm:h-12 sm:w-12',
                  available && 'group-hover:bg-gold/20',
                )}
              >
                <Icon className="h-5 w-5 text-gold sm:h-6 sm:w-6" strokeWidth={1.75} />
              </div>
              <span className="px-1 text-center font-heading text-[10px] font-bold uppercase leading-tight tracking-wide text-text sm:text-xs">
                {s.nombre}
              </span>
              {!available ? (
                <span className="text-[8px] font-semibold uppercase tracking-wide text-muted sm:text-[9px]">
                  Próximamente
                </span>
              ) : null}
            </div>
          );

          if (!available) {
            return (
              <div key={s.nombre} className="cursor-not-allowed" aria-disabled="true">
                {card}
              </div>
            );
          }

          if (isDecants) {
            return (
              <div key={s.nombre} className="relative">
                <button
                  type="button"
                  className="block w-full text-left"
                  onClick={() => setDecantOpen((v) => !v)}
                  aria-expanded={decantOpen}
                >
                  {card}
                </button>
                {decantOpen ? (
                  <div className="animate-scale-in absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-gold/30 bg-panel shadow-xl shadow-black/50">
                    {['5ml', '10ml'].map((ml) => (
                      <button
                        key={ml}
                        type="button"
                        onClick={() => {
                          setDecantOpen(false);
                          scrollToId(`decants-${ml}`);
                        }}
                        className="block min-h-11 w-full px-3.5 py-2.5 text-left text-sm font-semibold text-text transition-colors hover:bg-gold-bg hover:text-gold"
                      >
                        {ml}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          }

          return (
            <a
              key={s.nombre}
              href={s.link}
              className="block no-underline"
              onClick={(e) => {
                e.preventDefault();
                scrollToId(sectionId);
              }}
            >
              {card}
            </a>
          );
        })}
      </div>
    </section>
  );
}
