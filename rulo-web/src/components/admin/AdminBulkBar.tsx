import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { Product } from '@/types/product';
import { moneyARS } from '@/utils/money';
import { showToast } from '@/hooks/useAdminToast';

interface Props {
  count: number;
  selectedProducts: Product[];
  onClose: () => void;
  onApplyDiscountPct: (pct: number) => void;
  onApplyPriceDelta: (delta: number) => void;
  onApplyWholesale: (price: number) => void;
  onResetDiscounts: () => void;
}

export default function AdminBulkBar({
  count,
  selectedProducts,
  onClose,
  onApplyDiscountPct,
  onApplyPriceDelta,
  onApplyWholesale,
  onResetDiscounts,
}: Props) {
  const [showList, setShowList] = useState(false);
  const [pct, setPct] = useState('');
  const [monto, setMonto] = useState('');
  const [mayorista, setMayorista] = useState('');

  function applyDiscount() {
    const value = parseFloat(pct);
    if (!value || value <= 0 || value >= 100) {
      showToast('⚠️ Ingresá un % válido entre 1 y 99');
      return;
    }
    onApplyDiscountPct(value);
    setPct('');
  }

  function applyDelta(sign: 1 | -1) {
    const value = parseFloat(monto);
    if (!value || value <= 0) {
      showToast('⚠️ Ingresá un monto válido');
      return;
    }
    onApplyPriceDelta(value * sign);
    setMonto('');
  }

  function applyWholesale() {
    const value = parseFloat(mayorista);
    if (!value || value <= 0) {
      showToast('⚠️ Ingresá un precio válido');
      return;
    }
    onApplyWholesale(value);
    setMayorista('');
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-panel px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.4)] md:left-1/2 md:bottom-4 md:w-full md:max-w-xl md:-translate-x-1/2 md:rounded-2xl md:border">
      <div className="mx-auto flex max-w-xl flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowList((v) => !v)}
            className="flex items-center gap-1 text-sm font-semibold text-text"
          >
            {count} seleccionado{count > 1 ? 's' : ''}
            <ChevronDown size={14} className={showList ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition hover:border-danger hover:text-danger"
            aria-label="Cerrar selección"
          >
            <X size={14} />
          </button>
        </div>

        {showList && (
          <div className="flex max-h-36 flex-col gap-1.5 overflow-y-auto rounded-xl bg-card p-2.5 text-xs">
            {selectedProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 border-b border-border pb-1.5 last:border-0 last:pb-0">
                <span className="truncate text-text">{p.nombre}</span>
                <span className="shrink-0 font-semibold text-gold">${moneyARS(p.precio)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            value={pct}
            onChange={(e) => setPct(e.target.value)}
            placeholder="% descuento"
            className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-base text-text outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={applyDiscount}
            className="shrink-0 rounded-xl bg-gold px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap text-bg transition hover:bg-gold-light"
          >
            % Aplicar
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="$ a modificar"
            className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-base text-text outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={() => applyDelta(1)}
            className="shrink-0 rounded-xl bg-gold px-3.5 py-2.5 text-sm font-semibold text-bg transition hover:bg-gold-light"
          >
            ＋
          </button>
          <button
            type="button"
            onClick={() => applyDelta(-1)}
            className="shrink-0 rounded-xl border border-danger/30 bg-danger-bg px-3.5 py-2.5 text-sm font-semibold text-danger transition hover:opacity-80"
          >
            －
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={mayorista}
            onChange={(e) => setMayorista(e.target.value)}
            placeholder="$ precio mayorista"
            className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-base text-text outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={applyWholesale}
            className="shrink-0 rounded-xl bg-[#7c3aed] px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap text-white transition hover:opacity-90"
          >
            Mayorista
          </button>
        </div>

        <button
          type="button"
          onClick={onResetDiscounts}
          className="rounded-xl border border-danger/30 bg-danger-bg py-2.5 text-sm font-semibold text-danger transition hover:opacity-80"
        >
          ↺ Quitar descuentos
        </button>
      </div>
    </div>
  );
}
