import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '@/types/product';
import type { CatalogConfig } from '@/config/catalog';
import { useProductImage } from '@/hooks/useProductImage';
import { PriceDisplay } from './PriceDisplay';
import { NotesBlock } from './NotesBlock';

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-gold-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold">
      {children}
    </span>
  );
}

interface ProductModalProps {
  product: Product | null;
  config: CatalogConfig;
  onClose: () => void;
}

export function ProductModal({ product, config, onClose }: ProductModalProps) {
  const img = useProductImage(product?.imagen);

  useEffect(() => {
    if (!product) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.classList.add('overflow-hidden');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('overflow-hidden');
    };
  }, [product, onClose]);

  if (!product) return null;

  const price = config.getDisplayPrice(product);

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center" role="dialog" aria-modal="true">
      <div className="animate-fade-in absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-scale-in relative z-10 grid max-h-[92vh] w-full max-w-3xl grid-cols-1 overflow-y-auto rounded-t-3xl border border-border bg-panel shadow-2xl shadow-black/60 sm:grid-cols-[1fr_1.2fr] sm:rounded-3xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white"
        >
          ✕
        </button>

        <div className="flex items-center justify-center bg-white p-6">
          {img ? (
            <img src={img} alt={product.nombre} className="max-h-64 object-contain sm:max-h-80" />
          ) : null}
        </div>

        <div className="flex flex-col gap-3 p-5 sm:p-6">
          <div>
            <h2 className="font-heading text-xl font-bold">{product.nombre}</h2>
            <div className="mt-1.5">
              <PriceDisplay price={price} />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {product.marca ? <Badge>{product.marca}</Badge> : null}
            {product.genero ? <Badge>{product.genero}</Badge> : null}
            {product.ml ? <Badge>{product.ml}ml</Badge> : null}
          </div>

          <p className="text-sm text-muted">
            {product.descripcion || 'Consultá disponibilidad por WhatsApp.'}
          </p>

          <NotesBlock product={product} />

          <a
            href={config.waProductLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-12 items-center justify-center rounded-xl bg-wa text-sm font-bold text-[#06250f] transition-transform active:scale-[0.98]"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
