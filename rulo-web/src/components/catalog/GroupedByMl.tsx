import type { Product } from '@/types/product';
import type { CatalogConfig } from '@/config/catalog';
import { groupByMlAndBrand } from '@/utils/grouping';
import { ProductGrid } from './ProductGrid';

interface GroupedByMlProps {
  products: Product[];
  config: CatalogConfig;
  onOpenModal: (product: Product) => void;
  /** Wholesale catalog sorts products alphabetically within each brand. */
  sortWithinBrand?: boolean;
}

export function GroupedByMl({
  products,
  config,
  onOpenModal,
  sortWithinBrand = false,
}: GroupedByMlProps) {
  const groups = groupByMlAndBrand(products, sortWithinBrand);
  if (groups.length === 0) return null;

  return (
    <div className="space-y-8">
      {groups.map(([ml, brandGroups]) => (
        <div key={ml} id={`decants-${ml}`}>
          <h3 className="mb-4 border-b-2 border-gold pb-2 font-heading text-lg font-bold">{ml}</h3>
          <div className="space-y-6">
            {Object.entries(brandGroups).map(([marca, items]) => (
              <div key={marca}>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-gold">
                  {marca}
                </h4>
                <ProductGrid products={items} config={config} onOpenModal={onOpenModal} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
