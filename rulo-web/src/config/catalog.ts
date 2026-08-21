import type { CollectionName, Product } from '@/types/product';
import { retailProductWaLink, wholesaleProductWaLink } from '@/utils/whatsapp';

export interface DisplayPrice {
  current: number;
  original?: number;
  discountPct?: number;
  outOfStock: boolean;
}

export interface CatalogConfig {
  variant: 'retail' | 'wholesale';
  /** Whether fetched collections are cached in localStorage (5 min TTL). */
  cacheEnabled: boolean;
  getDisplayPrice(p: Product): DisplayPrice;
  /** Whether a product should be listed at all for this catalog. */
  filterEligible(p: Product): boolean;
  waProductLink(p: Product): string;
  /** Minimum units required per section before checkout — wholesale only. */
  minimums?: Partial<Record<CollectionName | 'mixto', number>>;
}

export const retailCatalogConfig: CatalogConfig = {
  variant: 'retail',
  cacheEnabled: true,
  filterEligible: (p) => p.activo !== false,
  waProductLink: retailProductWaLink,
  getDisplayPrice: (p) => {
    if (p.stock === false) {
      return { current: p.precio, outOfStock: true };
    }
    if (p.precio_descuento && p.precio_descuento < p.precio) {
      return {
        current: p.precio_descuento,
        original: p.precio,
        discountPct: Math.round((1 - p.precio_descuento / p.precio) * 100),
        outOfStock: false,
      };
    }
    return { current: p.precio, outOfStock: false };
  },
};

export const wholesaleCatalogConfig: CatalogConfig = {
  variant: 'wholesale',
  cacheEnabled: false,
  filterEligible: (p) => p.activo !== false && Boolean(p.precio_mayorista),
  waProductLink: wholesaleProductWaLink,
  getDisplayPrice: (p) => ({
    current: p.precio_mayorista || 0,
    outOfStock: false,
  }),
  minimums: {
    perfumes: 6,
    decants: 10,
    desodorantes: 5,
    bodysplash: 5,
    cremas: 5,
    mixto: 5,
  },
};
