import type { CollectionName, Product } from '@/types/product';

export type EstadoFilter = 'todos' | 'constock' | 'sinstock' | 'inactivo';
export type MlFilter = 'todos' | '5' | '10';

export const COLLECTION_LABELS: Record<CollectionName, string> = {
  perfumes: 'Perfumes',
  decants: 'Decants',
  promos: 'Kits',
  desodorantes: 'Desos',
  bodysplash: 'Body Splash',
  cremas: 'Crema/Serum',
  vapers: 'Vapers',
};

export interface AdminStats {
  total: number;
  conStock: number;
  sinStock: number;
  inactivos: number;
}

/** Client-side stat counts over a full collection array (mirrors admin.html renderStats). */
export function computeStats(products: Product[]): AdminStats {
  return {
    total: products.length,
    conStock: products.filter((p) => p.activo !== false && p.stock !== false).length,
    sinStock: products.filter((p) => p.stock === false).length,
    inactivos: products.filter((p) => p.activo === false).length,
  };
}

export function filterByEstado(products: Product[], estado: EstadoFilter): Product[] {
  switch (estado) {
    case 'constock':
      return products.filter((p) => p.activo !== false && p.stock !== false);
    case 'sinstock':
      return products.filter((p) => p.stock === false);
    case 'inactivo':
      return products.filter((p) => p.activo === false);
    default:
      return products;
  }
}

export function filterByMl(products: Product[], ml: MlFilter): Product[] {
  if (ml === 'todos') return products;
  return products.filter((p) => String(p.ml) === ml);
}

export function searchProducts(products: Product[], term: string): Product[] {
  const q = term.trim().toLowerCase();
  if (!q) return products;
  return products.filter(
    (p) => p.nombre.toLowerCase().includes(q) || (p.marca || '').toLowerCase().includes(q),
  );
}

export function hasActiveDiscount(p: Product): boolean {
  return Boolean(p.precio_descuento && p.precio_descuento < p.precio);
}

export function discountPercent(p: Product): number {
  if (!hasActiveDiscount(p)) return 0;
  return Math.round((1 - (p.precio_descuento as number) / p.precio) * 100);
}
