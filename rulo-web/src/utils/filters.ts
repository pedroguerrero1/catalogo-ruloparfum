import type { Product } from '@/types/product';

export type FilterOption = 'all' | 'hombre' | 'mujer' | 'unisex' | 'asc' | 'desc';

export interface FilterState {
  query: string;
  filter: FilterOption;
}

const GENDER_FILTERS: FilterOption[] = ['hombre', 'mujer', 'unisex'];

export function matchesQuery(p: Product, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    p.nombre.toLowerCase().includes(q) || (p.marca || '').toLowerCase().includes(q)
  );
}

export function matchesGender(p: Product, filter: FilterOption): boolean {
  if (!GENDER_FILTERS.includes(filter)) return true;
  return (p.genero || '').toLowerCase() === filter;
}

/**
 * Text search applies to every section. Gender filtering and price sorting only
 * apply to the "perfumes" section, matching the original catalog behaviour —
 * decants/promos/desodorantes/bodysplash are search-only.
 */
export function applyFilters(
  products: Product[],
  state: FilterState,
  getPrice: (p: Product) => number,
  options: { applyGenderAndSort?: boolean } = {},
): Product[] {
  const { applyGenderAndSort = true } = options;

  let list = products.filter((p) => matchesQuery(p, state.query));

  if (applyGenderAndSort) {
    list = list.filter((p) => matchesGender(p, state.filter));
    const direction = state.filter === 'asc' ? 1 : -1; // default (incl. "desc"/"all") sorts descending
    list = [...list].sort((a, b) => (getPrice(a) - getPrice(b)) * direction);
  }

  return list;
}
