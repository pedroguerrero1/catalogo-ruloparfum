import type { Product } from '@/types/product';

function sortByName(list: Product[]): Product[] {
  return [...list].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

export function groupByBrand(
  products: Product[],
  sortWithinBrand = false,
): Record<string, Product[]> {
  const groups: Record<string, Product[]> = {};
  for (const p of products) {
    const marca = p.marca || 'Otros';
    if (!groups[marca]) groups[marca] = [];
    groups[marca].push(p);
  }
  if (sortWithinBrand) {
    for (const marca of Object.keys(groups)) {
      groups[marca] = sortByName(groups[marca]);
    }
  }
  return groups;
}

export interface LineGroups {
  disenador: Record<string, Product[]>;
  arabe: Record<string, Product[]>;
}

/** Splits perfumes by línea (diseñador/nicho vs árabe) then groups each by marca. */
export function groupByLineAndBrand(products: Product[], sortWithinBrand = false): LineGroups {
  const disenadores = products.filter((p) => p.linea === 'disenador');
  const arabes = products.filter((p) => p.linea !== 'disenador');
  return {
    disenador: groupByBrand(disenadores, sortWithinBrand),
    arabe: groupByBrand(arabes, sortWithinBrand),
  };
}

/** Groups decants by ml, sorted ascending numerically ('Otros' last). */
export function groupByMl(products: Product[]): Array<[string, Product[]]> {
  const groups: Record<string, Product[]> = {};
  for (const p of products) {
    const key = p.ml ? `${p.ml}ml` : 'Otros';
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }
  return Object.entries(groups).sort(([a], [b]) => {
    const na = parseInt(a, 10);
    const nb = parseInt(b, 10);
    if (Number.isNaN(na)) return 1;
    if (Number.isNaN(nb)) return -1;
    return na - nb;
  });
}

/** Groups decants by ml, then by marca within each ml — mirrors groupByLineAndBrand. */
export function groupByMlAndBrand(
  products: Product[],
  sortWithinBrand = false,
): Array<[string, Record<string, Product[]>]> {
  return groupByMl(products).map(([ml, items]) => [ml, groupByBrand(items, sortWithinBrand)]);
}

/** Sorted, deduplicated list of brands present in a product list. */
export function uniqueBrands(products: Product[]): string[] {
  const set = new Set(products.map((p) => p.marca || 'Otros'));
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
}
