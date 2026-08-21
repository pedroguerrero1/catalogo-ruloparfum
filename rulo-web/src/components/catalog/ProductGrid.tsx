import type { Product } from '@/types/product';
import type { CatalogConfig } from '@/config/catalog';
import { ProductCard } from '@/components/product/ProductCard';

interface ProductGridProps {
  products: Product[];
  config: CatalogConfig;
  onOpenModal: (product: Product) => void;
}

export function ProductGrid({ products, config, onOpenModal }: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} config={config} onOpenModal={onOpenModal} />
      ))}
    </div>
  );
}
