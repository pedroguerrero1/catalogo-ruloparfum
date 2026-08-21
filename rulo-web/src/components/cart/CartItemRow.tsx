import type { ReactNode } from 'react';
import type { Product } from '@/types/product';
import { useProductImage } from '@/hooks/useProductImage';

interface CartItemRowProps {
  product: Product;
  priceLabel: string;
  trailing: ReactNode;
}

export function CartItemRow({ product, priceLabel, trailing }: CartItemRowProps) {
  const img = useProductImage(product.imagen);

  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-2">
      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-white">
        {img ? (
          <img src={img} alt={product.nombre} className="h-full w-full object-contain p-1" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{product.nombre}</p>
        <p className="text-xs font-bold text-gold">{priceLabel}</p>
      </div>
      <div className="flex-shrink-0">{trailing}</div>
    </div>
  );
}
