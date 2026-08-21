import type { Product } from '@/types/product';
import type { CatalogConfig } from '@/config/catalog';
import { useProductImage } from '@/hooks/useProductImage';
import { PriceDisplay } from './PriceDisplay';
import { RetailCardActions } from './RetailCardActions';
import { WholesaleCardActions } from './WholesaleCardActions';

interface ProductCardProps {
  product: Product;
  config: CatalogConfig;
  onOpenModal: (product: Product) => void;
}

export function ProductCard({ product, config, onOpenModal }: ProductCardProps) {
  const img = useProductImage(product.imagen);
  const price = config.getDisplayPrice(product);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-bg shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-xl hover:shadow-gold/10">
      <button
        type="button"
        onClick={() => onOpenModal(product)}
        className="relative flex h-[160px] items-center justify-center overflow-hidden bg-white sm:h-[190px]"
      >
        {price.outOfStock ? (
          <span className="absolute right-[-32px] top-[14px] z-10 w-[120px] rotate-45 bg-danger py-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-white shadow">
            Agotado
          </span>
        ) : null}
        {img ? (
          <img
            src={img}
            alt={product.nombre}
            loading="lazy"
            className="max-h-full max-w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full animate-pulse bg-black/5" />
        )}
      </button>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <button type="button" onClick={() => onOpenModal(product)} className="text-left">
          <h3 className="font-heading text-sm font-bold leading-snug line-clamp-2 sm:text-base">
            {product.nombre}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[11px] uppercase tracking-wide text-muted">
            <span>{product.marca}</span>
            {product.ml ? (
              <>
                <span className="text-gold">•</span>
                <span>{product.ml}ml</span>
              </>
            ) : null}
          </div>
        </button>

        <PriceDisplay price={price} />

        <div className="mt-auto flex flex-col gap-1.5 pt-1">
          {config.variant === 'retail' ? (
            <RetailCardActions product={product} />
          ) : (
            <WholesaleCardActions product={product} />
          )}
          <a
            href={config.waProductLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex min-h-9 items-center justify-center rounded-xl bg-wa-bg text-[11px] font-bold uppercase tracking-wide text-wa transition-all duration-200 hover:bg-wa hover:text-[#06250f] active:scale-[0.97]"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
