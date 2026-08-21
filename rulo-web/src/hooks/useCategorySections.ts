import { useQuery } from '@tanstack/react-query';
import type { Section } from '@/types/product';

export function useCategorySections() {
  return useQuery({
    queryKey: ['sections'],
    queryFn: async (): Promise<Section[]> => {
      const res = await fetch('/data/secciones.json');
      return res.json();
    },
    staleTime: Infinity,
  });
}
