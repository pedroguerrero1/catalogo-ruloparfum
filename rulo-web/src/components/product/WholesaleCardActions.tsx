import type { Product } from '@/types/product';
import { useCartWholesaleStore } from '@/store/cartWholesaleStore';

export function WholesaleCardActions({ product }: { product: Product }) {
  const line = useCartWholesaleStore((s) => s.items[product.id]);
  const add = useCartWholesaleStore((s) => s.add);
  const changeQty = useCartWholesaleStore((s) => s.changeQty);
  const seccion = product._seccion ?? 'perfumes';

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  if (!line) {
    return (
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          add(product.id, seccion);
        }}
        className="min-h-11 w-full rounded-xl bg-gold-bg text-xs font-bold uppercase tracking-wide text-gold transition-all duration-200 hover:bg-gold hover:text-bg hover:shadow-md hover:shadow-gold/20 active:scale-[0.97]"
      >
        + Agregar
      </button>
    );
  }

  return (
    <div className="flex min-h-11 items-center justify-between rounded-xl bg-gold-bg px-2">
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          changeQty(product.id, -1);
        }}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg/40 text-lg font-bold text-gold active:scale-95"
        aria-label="Restar"
      >
        −
      </button>
      <span className="font-heading text-sm font-bold text-gold">{line.cant}</span>
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          changeQty(product.id, 1);
        }}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg/40 text-lg font-bold text-gold active:scale-95"
        aria-label="Sumar"
      >
        +
      </button>
    </div>
  );
}
