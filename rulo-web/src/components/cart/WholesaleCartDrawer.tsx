import clsx from 'clsx';
import type { Product } from '@/types/product';
import type { CatalogConfig } from '@/config/catalog';
import { useCartWholesaleStore } from '@/store/cartWholesaleStore';
import { moneyARS } from '@/utils/money';
import { wholesaleCartWaLink } from '@/utils/whatsapp';
import { calculateWholesaleMinimum } from '@/utils/wholesaleMinimum';
import { CartDrawerShell } from './CartDrawerShell';
import { CartItemRow } from './CartItemRow';
import { MinimumOrderNotice } from './MinimumOrderNotice';

interface WholesaleCartDrawerProps {
  open: boolean;
  onClose: () => void;
  config: CatalogConfig;
  products: Product[];
}

export function WholesaleCartDrawer({ open, onClose, config, products }: WholesaleCartDrawerProps) {
  const items = useCartWholesaleStore((s) => s.items);
  const changeQty = useCartWholesaleStore((s) => s.changeQty);
  const remove = useCartWholesaleStore((s) => s.remove);

  const lines = Object.entries(items)
    .map(([id, line]) => ({
      product: products.find((p) => p.id === Number(id)),
      cant: line.cant,
    }))
    .filter((l): l is { product: Product; cant: number } => Boolean(l.product));

  const total = lines.reduce((sum, l) => sum + (l.product.precio_mayorista || 0) * l.cant, 0);
  const minCheck = calculateWholesaleMinimum(items, config.minimums || {});
  const canSend = minCheck.ok && lines.length > 0;

  return (
    <CartDrawerShell
      open={open}
      onClose={onClose}
      title="Mi Pedido Mayorista 🛒"
      footer={
        <>
          <MinimumOrderNotice check={minCheck} />
          <div className="mb-3 flex items-center justify-between text-sm font-semibold">
            <span>Total estimado:</span>
            <span className="text-gold">${moneyARS(total)}</span>
          </div>
          <a
            href={canSend ? wholesaleCartWaLink(lines.map((l) => ({ product: l.product, cantidad: l.cant }))) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              'flex min-h-12 items-center justify-center rounded-xl text-sm font-bold transition-transform active:scale-[0.98]',
              canSend ? 'bg-wa text-[#06250f]' : 'pointer-events-none bg-card text-muted opacity-60',
            )}
          >
            Enviar pedido por WhatsApp
          </a>
        </>
      }
    >
      {lines.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Todavía no agregaste productos.</p>
      ) : (
        <div className="space-y-3">
          {lines.map(({ product, cant }) => (
            <CartItemRow
              key={product.id}
              product={product}
              priceLabel={`$${moneyARS((product.precio_mayorista || 0) * cant)} · x${cant}`}
              trailing={
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => changeQty(product.id, -1)}
                    aria-label="Restar"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-bg text-sm font-bold text-gold active:scale-95"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-bold">{cant}</span>
                  <button
                    type="button"
                    onClick={() => changeQty(product.id, 1)}
                    aria-label="Sumar"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-bg text-sm font-bold text-gold active:scale-95"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    aria-label="Quitar"
                    className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-danger"
                  >
                    ✕
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </CartDrawerShell>
  );
}
