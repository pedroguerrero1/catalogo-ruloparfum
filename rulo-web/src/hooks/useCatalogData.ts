import { useQueries } from '@tanstack/react-query';
import { COLLECTIONS, type Product } from '@/types/product';
import { fetchCollection } from '@/firebase/products';
import type { CatalogConfig } from '@/config/catalog';

export interface CatalogData {
  perfumes: Product[];
  decants: Product[];
  promos: Product[];
  desodorantes: Product[];
  bodysplash: Product[];
  cremas: Product[];
  vapers: Product[];
  isLoading: boolean;
}

/**
 * Fetches all product collections for a catalog variant.
 * staleTime mirrors the old localStorage TTL: 5 min for retail, always-fresh
 * for wholesale (which never cached in the original app.js/mayorista.js).
 */
export function useCatalogData(config: CatalogConfig): CatalogData {
  const staleTime = config.cacheEnabled ? 5 * 60 * 1000 : 0;

  const results = useQueries({
    queries: COLLECTIONS.map((name) => ({
      queryKey: ['catalog', config.variant, name],
      queryFn: () => fetchCollection(name),
      staleTime,
      select: (data: Product[]) =>
        data.filter(config.filterEligible).map((p) => ({ ...p, _seccion: name })),
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const [perfumes, decants, promos, desodorantes, bodysplash, cremas, vapers] = results.map(
    (r) => (r.data as Product[] | undefined) ?? [],
  );

  return { perfumes, decants, promos, desodorantes, bodysplash, cremas, vapers, isLoading };
}
