import type { DisplayPrice } from '@/config/catalog';
import { moneyARS } from '@/utils/money';

export function PriceDisplay({ price }: { price: DisplayPrice }) {
  if (price.outOfStock) {
    return <span className="text-sm font-bold text-danger">Sin stock</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {price.original ? (
        <span className="text-xs text-muted line-through">${moneyARS(price.original)}</span>
      ) : null}
      <span className="font-heading text-lg font-extrabold text-gold">
        ${moneyARS(price.current)}
      </span>
      {price.discountPct ? (
        <span className="rounded-full bg-danger-bg px-1.5 py-0.5 text-[10px] font-bold text-danger">
          -{price.discountPct}%
        </span>
      ) : null}
    </div>
  );
}
