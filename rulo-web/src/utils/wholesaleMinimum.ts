import type { CollectionName } from '@/types/product';
import type { WholesaleCartLine } from '@/store/cartWholesaleStore';

export interface MinimumCheck {
  ok: boolean;
  msg: string;
  total: number;
}

/**
 * A single section in the cart uses that section's minimum; mixing sections
 * falls back to the (usually lower) "mixto" minimum instead of stacking them.
 */
export function calculateWholesaleMinimum(
  items: Record<number, WholesaleCartLine>,
  minimums: Partial<Record<CollectionName | 'mixto', number>>,
): MinimumCheck {
  const lines = Object.values(items);
  const total = lines.reduce((sum, l) => sum + l.cant, 0);
  const mixto = minimums.mixto ?? 5;

  if (total === 0) {
    return { ok: false, msg: '', total };
  }

  const sections = new Set(lines.map((l) => l.seccion || 'perfumes'));

  if (sections.size > 1) {
    const faltan = mixto - total;
    return faltan > 0
      ? { ok: false, msg: `⚠️ Mínimo ${mixto} unidades en total (te faltan ${faltan})`, total }
      : { ok: true, msg: `✅ ${total} unidades — listo para enviar`, total };
  }

  const [section] = sections;
  const minimo = minimums[section] ?? mixto;
  const faltan = minimo - total;

  return faltan > 0
    ? { ok: false, msg: `⚠️ Mínimo ${minimo} ${section} (te faltan ${faltan})`, total }
    : { ok: true, msg: `✅ ${total} unidades — listo para enviar`, total };
}
