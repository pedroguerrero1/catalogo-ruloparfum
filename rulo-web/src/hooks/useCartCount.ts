import { useCartRetailStore } from '@/store/cartRetailStore';
import { useCartWholesaleStore } from '@/store/cartWholesaleStore';

export function useCartCount(variant: 'retail' | 'wholesale'): number {
  const retailCount = useCartRetailStore((s) => s.ids.length);
  const wholesaleCount = useCartWholesaleStore((s) =>
    Object.values(s.items).reduce((sum, l) => sum + l.cant, 0),
  );
  return variant === 'retail' ? retailCount : wholesaleCount;
}
