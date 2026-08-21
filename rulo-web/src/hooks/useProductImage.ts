import { useQuery } from '@tanstack/react-query';
import { getImageUrl } from '@/firebase/storage';

export function useProductImage(path?: string | null): string | undefined {
  const { data } = useQuery({
    queryKey: ['img', path],
    queryFn: () => getImageUrl(path),
    staleTime: Infinity,
    enabled: Boolean(path),
  });
  return data;
}
