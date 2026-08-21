import type { Product } from '@/types/product';
import { moneyARS } from './money';

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5493535669706';

function buildWaUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function retailProductWaLink(p: Product): string {
  const precioTexto =
    p.stock === false ? 'Sin stock' : `$${moneyARS(p.precio_descuento || p.precio)}`;
  return buildWaUrl(
    `Hola! Vi en la web el *${p.nombre}* (${p.ml}ml) por ${precioTexto}. ¿Lo tenés disponible?`,
  );
}

export function wholesaleProductWaLink(p: Product): string {
  return buildWaUrl(
    `Hola! Vi en el catálogo mayorista el *${p.nombre}* (${p.ml}ml) por $${moneyARS(
      p.precio_mayorista || 0,
    )}. ¿Lo tenés disponible?`,
  );
}

export function retailCartWaLink(items: Product[]): string {
  const lista = items.map((p) => `- ${p.nombre} (${p.ml}ml)`).join('\n');
  return buildWaUrl(
    `Hola Rulo! Me interesan estos productos de tu catálogo:\n\n${lista}\n¿Los tenés disponibles?`,
  );
}

export interface WholesaleCartLine {
  product: Product;
  cantidad: number;
}

export function wholesaleCartWaLink(lines: WholesaleCartLine[]): string {
  const lista = lines
    .map(
      (l) =>
        `- ${l.product.nombre} (${l.product.ml}ml) x${l.cantidad} — $${moneyARS(
          (l.product.precio_mayorista || 0) * l.cantidad,
        )}`,
    )
    .join('\n');
  const total = lines.reduce((sum, l) => sum + l.cantidad, 0);
  return buildWaUrl(
    `Hola Rulo! Te hago el siguiente pedido mayorista:\n\n${lista}\n\nTotal: ${total} unidades`,
  );
}
