import { useState } from 'react';
import type { FilterOption } from '@/utils/filters';

const LOGO_URL =
  'https://firebasestorage.googleapis.com/v0/b/ruloparfum.firebasestorage.app/o/img%2Flogo.png?alt=media&token=ec2aeaac-160a-43d4-9ed0-3611abc172b1';

const NAV_LINKS = [
  { href: '#perfumes', label: 'Perfumes' },
  { href: '#decants', label: 'Decants' },
  { href: '#promos', label: 'Kits' },
  { href: '#desodorantes', label: 'Desodorantes' },
  { href: '#bodysplash', label: 'Body Splash' },
  { href: '#cremas', label: 'Crema/Serum' },
  { href: '#vapers', label: 'Vapers' },
];

interface HeaderProps {
  variant: 'retail' | 'wholesale';
  query: string;
  onQueryChange: (v: string) => void;
  filter: FilterOption;
  onFilterChange: (v: FilterOption) => void;
}

export function Header({ variant, query, onQueryChange, filter, onFilterChange }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 shadow-lg shadow-black/20 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="Rulo BarberShop"
            className="h-10 w-10 flex-shrink-0 rounded-full object-cover ring-2 ring-gold/40"
          />
          <div>
            <div className="font-heading text-base font-extrabold leading-none tracking-tight">
              RULO Parfum
              {variant === 'wholesale' ? (
                <span className="ml-2 inline-block rounded-full bg-gradient-to-r from-gold to-gold-light px-2.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-bg">
                  Mayorista
                </span>
              ) : null}
            </div>
            <div className="mt-0.5 hidden text-xs text-muted sm:block">
              {variant === 'wholesale'
                ? 'BarberShop • Catálogo Mayorista'
                : 'BarberShop • Perfumes Árabes'}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:max-w-md sm:flex-1 sm:flex-row sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar perfume..."
            className="min-h-11 w-full min-w-0 rounded-xl border border-border bg-card px-3 text-sm text-text placeholder:text-muted focus:border-gold focus:outline-none sm:flex-1"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="min-h-11 flex-1 rounded-xl border border-border bg-card px-3 text-xs font-semibold sm:hidden"
            >
              Categoría
            </button>
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value as FilterOption)}
              className="min-h-11 flex-1 rounded-xl border border-border bg-card px-2 text-xs font-semibold text-text focus:border-gold focus:outline-none sm:flex-none sm:text-sm"
            >
              <option value="all">Todos</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="unisex">Unisex</option>
              <option value="asc">Precio: menor a mayor</option>
              <option value="desc">Precio: mayor a menor</option>
            </select>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <nav className="flex flex-col border-t border-border bg-panel px-4 py-1 sm:hidden">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="flex min-h-11 items-center border-b border-border/60 text-sm font-semibold last:border-0"
            >
              {l.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
