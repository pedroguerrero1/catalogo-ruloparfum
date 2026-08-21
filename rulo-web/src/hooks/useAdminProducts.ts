import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CollectionName, Product } from '@/types/product';
import { deleteProduct, fetchCollection, patchProduct, saveProduct } from '@/firebase/products';

/**
 * Loads and mutates the products of one collection (one admin tab).
 * Uses its own react-query namespace ('admin-products') so it never shares
 * cache/staleTime behavior with the public catalog's `useCatalogData`.
 */
export function useAdminProducts(collectionName: CollectionName) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ['admin-products', collectionName] as const, [collectionName]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchCollection(collectionName),
  });

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey }),
    [queryClient, queryKey],
  );

  const saveMutation = useMutation({
    mutationFn: (product: Product) => saveProduct(collectionName, product.id, product),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(collectionName, id),
    onSuccess: invalidate,
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, fields }: { id: number; fields: Partial<Product> }) =>
      patchProduct(collectionName, id, fields),
    onSuccess: invalidate,
  });

  /**
   * Runs one patch per id in parallel (mirrors admin.html's
   * `Promise.all` bulk actions), then refreshes the list once.
   * `fieldsFor` returning null skips that id.
   */
  const bulkPatch = useCallback(
    async (ids: number[], fieldsFor: (id: number) => Partial<Product> | null) => {
      await Promise.all(
        ids.map((id) => {
          const fields = fieldsFor(id);
          return fields ? patchProduct(collectionName, id, fields) : Promise.resolve();
        }),
      );
      await invalidate();
    },
    [collectionName, invalidate],
  );

  return {
    products: data ?? [],
    isLoading,
    isError,
    refetch,
    save: saveMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    patch: (id: number, fields: Partial<Product>) => patchMutation.mutateAsync({ id, fields }),
    bulkPatch,
  };
}
