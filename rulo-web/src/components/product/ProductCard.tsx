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
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-wa-bg text-xs font-bold uppercase tracking-wide text-wa transition-all duration-200 hover:bg-wa hover:text-[#06250f] active:scale-[0.97]"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Consultar
          </a>
        </div>
      </div>
    </div>
  );
}
