import clsx from 'clsx';
import type { Product } from '@/types/product';
import { useCartRetailStore } from '@/store/cartRetailStore';

export function RetailCardActions({ product }: { product: Product }) {
  const inCart = useCartRetailStore((s) => s.ids.includes(product.id));
  const toggle = useCartRetailStore((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggle(product.id);
      }}
      className={clsx(
        'min-h-11 w-full rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-200 active:scale-[0.97]',
        inCart ? 'bg-wa text-[#06250f]' : 'bg-gold-bg text-gold hover:bg-gold hover:text-bg hover:shadow-md hover:shadow-gold/20',
      )}
    >
      {inCart ? '✓ En tu pedido' : '+ Agregar'}
    </button>
  );
}
