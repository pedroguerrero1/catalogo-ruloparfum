import type { Product } from '@/types/product';

/** Rounds like admin.html: Math.round(precio * (1 - pct/100)). */
export function applyDiscountPct(precio: number, pct: number): number {
  return Math.round(precio * (1 - pct / 100));
}

/** Never lets a price go below 0. */
export function applyPriceDelta(precio: number, delta: number): number {
  return Math.max(0, precio + delta);
}

export function bulkDiscountFields(product: Product, pct: number): Partial<Product> {
  return { precio_descuento: applyDiscountPct(product.precio, pct) };
}

export function bulkPriceDeltaFields(product: Product, delta: number): Partial<Product> {
  return { precio: applyPriceDelta(product.precio, delta) };
}

export function bulkWholesaleFields(precioMayorista: number): Partial<Product> {
  return { precio_mayorista: precioMayorista };
}

export function bulkResetDiscountFields(): Partial<Product> {
  return { precio_descuento: null };
}
