import clsx from 'clsx';
import type { Product } from '@/types/product';
import type { CatalogConfig } from '@/config/catalog';
import { useCartRetailStore } from '@/store/cartRetailStore';
import { moneyARS } from '@/utils/money';
import { retailCartWaLink } from '@/utils/whatsapp';
import { CartDrawerShell } from './CartDrawerShell';
import { CartItemRow } from './CartItemRow';

interface RetailCartDrawerProps {
  open: boolean;
  onClose: () => void;
  config: CatalogConfig;
  products: Product[];
}

export function RetailCartDrawer({ open, onClose, config, products }: RetailCartDrawerProps) {
  const ids = useCartRetailStore((s) => s.ids);
  const remove = useCartRetailStore((s) => s.remove);

  const items = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const total = items.reduce((sum, p) => sum + config.getDisplayPrice(p).current, 0);

  return (
    <CartDrawerShell
      open={open}
      onClose={onClose}
      title="Mi Pedido 🛒"
      footer={
        <>
          <div className="mb-3 flex items-center justify-between text-sm font-semibold">
            <span>Total estimado:</span>
            <span className="text-gold">${moneyARS(total)}</span>
          </div>
          <a
            href={items.length ? retailCartWaLink(items) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              'flex min-h-12 items-center justify-center rounded-xl text-sm font-bold transition-transform active:scale-[0.98]',
              items.length
                ? 'bg-wa text-[#06250f]'
                : 'pointer-events-none bg-card text-muted opacity-60',
            )}
          >
            Consultar compra por WhatsApp
          </a>
        </>
      }
    >
      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Todavía no agregaste productos.</p>
      ) : (
        <div className="space-y-3">
          {items.map((p) => {
            const price = config.getDisplayPrice(p);
            return (
              <CartItemRow
                key={p.id}
                product={p}
                priceLabel={`$${moneyARS(price.current)}`}
                trailing={
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    aria-label="Quitar"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:text-danger"
                  >
                    ✕
                  </button>
                }
              />
            );
          })}
        </div>
      )}
    </CartDrawerShell>
  );
}
