import type { Product } from '@/types/product';
import type { CatalogConfig } from '@/config/catalog';
import { groupByLineAndBrand } from '@/utils/grouping';
import { ProductGrid } from './ProductGrid';

interface GroupedByLineAndBrandProps {
  products: Product[];
  config: CatalogConfig;
  onOpenModal: (product: Product) => void;
  /** Wholesale catalog sorts products alphabetically within each brand. */
  sortWithinBrand?: boolean;
}

export function GroupedByLineAndBrand({
  products,
  config,
  onOpenModal,
  sortWithinBrand = false,
}: GroupedByLineAndBrandProps) {
  const { disenador, arabe } = groupByLineAndBrand(products, sortWithinBrand);
  const hasDisenador = Object.keys(disenador).length > 0;
  const hasArabe = Object.keys(arabe).length > 0;

  if (!hasDisenador && !hasArabe) return null;

  return (
    <div className="space-y-8">
      {hasDisenador ? (
        <BrandLineSection
          title="✨ Perfumes de Diseñador / Nicho"
          groups={disenador}
          config={config}
          onOpenModal={onOpenModal}
        />
      ) : null}
      {hasArabe ? (
        <BrandLineSection
          title="🌙 Perfumes Árabes"
          groups={arabe}
          config={config}
          onOpenModal={onOpenModal}
        />
      ) : null}
    </div>
  );
}

function BrandLineSection({
  title,
  groups,
  config,
  onOpenModal,
}: {
  title: string;
  groups: Record<string, Product[]>;
  config: CatalogConfig;
  onOpenModal: (product: Product) => void;
}) {
  return (
    <div>
      <h3 className="mb-4 border-b-2 border-gold pb-2 font-heading text-lg font-bold">{title}</h3>
      <div className="space-y-6">
        {Object.entries(groups).map(([marca, items]) => (
          <div key={marca}>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-gold">
              {marca}
            </h4>
            <ProductGrid products={items} config={config} onOpenModal={onOpenModal} />
          </div>
        ))}
      </div>
    </div>
  );
}
