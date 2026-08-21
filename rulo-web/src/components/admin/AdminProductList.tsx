import { clsx } from 'clsx';
import { Pencil, RefreshCcw, Trash2 } from 'lucide-react';
import type { Product } from '@/types/product';
import { useProductImage } from '@/hooks/useProductImage';
import { moneyARS } from '@/utils/money';
import { discountPercent, hasActiveDiscount } from '@/utils/adminFilters';

interface Props {
  products: Product[];
  loading: boolean;
  selected: Set<number>;
  onToggleSelect: (id: number) => void;
  onEdit: (product: Product) => void;
  onToggleStock: (product: Product) => void;
  onDelete: (product: Product) => void;
  onResetDiscount: (id: number) => void;
}

function ProductThumb({ path, alt, className }: { path?: string; alt: string; className: string }) {
  const src = useProductImage(path);
  if (!src) return <div className={clsx(className, 'animate-pulse bg-card')} aria-hidden />;
  return <img src={src} alt={alt} loading="lazy" className={className} />;
}

function estadoInfo(p: Product) {
  if (p.activo === false) return { text: 'Inactivo', className: 'bg-card text-muted' };
  if (p.stock === false) return { text: 'Sin stock', className: 'bg-danger-bg text-danger' };
  return { text: 'Con stock', className: 'bg-wa-bg text-wa' };
}

export default function AdminProductList({
  products,
  loading,
  selected,
  onToggleSelect,
  onEdit,
  onToggleStock,
  onDelete,
  onResetDiscount,
}: Props) {
  if (loading) {
    return <div className="py-16 text-center text-sm text-muted">Cargando...</div>;
  }

  if (products.length === 0) {
    return <div className="py-16 text-center text-sm text-muted">No hay productos.</div>;
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {products.map((p) => {
          const isSelected = selected.has(p.id);
          const discounted = hasActiveDiscount(p);
          const pct = discountPercent(p);
          const estado = estadoInfo(p);

          return (
            <div
              key={p.id}
              className={clsx(
                'flex gap-3 rounded-xl border p-3 transition-colors',
                isSelected ? 'border-gold bg-gold-bg' : 'border-border bg-panel',
              )}
            >
              <label className="flex shrink-0 items-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(p.id)}
                  className="h-5 w-5 accent-gold"
                  aria-label={`Seleccionar ${p.nombre}`}
                />
              </label>
              <ProductThumb path={p.imagen} alt={p.nombre} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-semibold text-text">{p.nombre}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {discounted ? (
                    <>
                      <span className="text-xs text-muted line-through">${moneyARS(p.precio)}</span>
                      <span className="text-sm font-bold text-gold">
                        ${moneyARS(p.precio_descuento as number)}
                      </span>
                      <span className="rounded-full bg-danger-bg px-1.5 py-0.5 text-[10px] font-bold text-danger">
                        -{pct}%
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-gold">${moneyARS(p.precio)}</span>
                  )}
                  <span className={clsx('rounded-full px-2 py-0.5 text-[10px] font-semibold', estado.className)}>
                    {estado.text}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEdit(p)}
                    className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text transition hover:border-gold hover:text-gold"
                  >
                    <Pencil size={12} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleStock(p)}
                    className={clsx(
                      'rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition',
                      p.stock === false
                        ? 'border-wa/40 bg-wa-bg text-wa'
                        : 'border-border text-text hover:border-danger hover:text-danger',
                    )}
                  >
                    {p.stock === false ? '✅ Activar' : '🚫 Agotar'}
                  </button>
                  {discounted && (
                    <button
                      type="button"
                      onClick={() => onResetDiscount(p.id)}
                      className="flex items-center gap-1 rounded-lg border border-danger/30 bg-danger-bg px-2.5 py-1.5 text-xs font-semibold text-danger transition hover:opacity-80"
                    >
                      <RefreshCcw size={12} /> Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDelete(p)}
                    className="flex items-center gap-1 rounded-lg border border-danger/30 bg-danger-bg px-2.5 py-1.5 text-xs font-semibold text-danger transition hover:opacity-80"
                  >
                    <Trash2 size={12} /> Borrar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-panel text-left text-xs uppercase tracking-wide text-muted">
              <th className="w-10 px-3 py-2.5"></th>
              <th className="w-16 px-3 py-2.5">Img</th>
              <th className="px-3 py-2.5">Nombre</th>
              <th className="px-3 py-2.5">Marca</th>
              <th className="px-3 py-2.5">Precio</th>
              <th className="px-3 py-2.5">Estado</th>
              <th className="px-3 py-2.5">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const isSelected = selected.has(p.id);
              const discounted = hasActiveDiscount(p);
              const pct = discountPercent(p);
              const estado = estadoInfo(p);

              return (
                <tr
                  key={p.id}
                  className={clsx(
                    'border-b border-border last:border-0',
                    isSelected ? 'bg-gold-bg' : 'bg-transparent hover:bg-card/60',
                  )}
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(p.id)}
                      className="h-4 w-4 accent-gold"
                      aria-label={`Seleccionar ${p.nombre}`}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <ProductThumb path={p.imagen} alt={p.nombre} className="h-10 w-10 rounded-lg object-cover" />
                  </td>
                  <td className="max-w-[220px] truncate px-3 py-2.5 font-semibold text-text">{p.nombre}</td>
                  <td className="px-3 py-2.5 text-muted">{p.marca || '-'}</td>
                  <td className="px-3 py-2.5">
                    {discounted ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted line-through">${moneyARS(p.precio)}</span>
                        <span className="font-bold text-gold">${moneyARS(p.precio_descuento as number)}</span>
                        <span className="rounded-full bg-danger-bg px-1.5 py-0.5 text-[10px] font-bold text-danger">
                          -{pct}%
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-gold">${moneyARS(p.precio)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={clsx('rounded-full px-2 py-0.5 text-[11px] font-semibold', estado.className)}>
                      {estado.text}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text transition hover:border-gold hover:text-gold"
                      >
                        <Pencil size={12} /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleStock(p)}
                        className={clsx(
                          'rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition',
                          p.stock === false
                            ? 'border-wa/40 bg-wa-bg text-wa'
                            : 'border-border text-text hover:border-danger hover:text-danger',
                        )}
                      >
                        {p.stock === false ? '✅ Activar' : '🚫 Agotar'}
                      </button>
                      {discounted && (
                        <button
                          type="button"
                          onClick={() => onResetDiscount(p.id)}
                          className="flex items-center gap-1 rounded-lg border border-danger/30 bg-danger-bg px-2.5 py-1.5 text-xs font-semibold text-danger transition hover:opacity-80"
                        >
                          <RefreshCcw size={12} /> Reset
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete(p)}
                        className="flex items-center gap-1 rounded-lg border border-danger/30 bg-danger-bg px-2.5 py-1.5 text-xs font-semibold text-danger transition hover:opacity-80"
                      >
                        <Trash2 size={12} /> Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
