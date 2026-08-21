import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { CollectionName, Product } from '@/types/product';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { useAdminSelection } from '@/hooks/useAdminSelection';
import { showToast } from '@/hooks/useAdminToast';
import {
  COLLECTION_LABELS,
  computeStats,
  filterByEstado,
  filterByMl,
  hasActiveDiscount,
  searchProducts,
  type EstadoFilter,
  type MlFilter,
} from '@/utils/adminFilters';
import {
  bulkDiscountFields,
  bulkPriceDeltaFields,
  bulkResetDiscountFields,
  bulkWholesaleFields,
} from '@/utils/adminBulkActions';
import { moneyARS } from '@/utils/money';
import AdminStatsBar from './AdminStatsBar';
import AdminFilters from './AdminFilters';
import AdminProductList from './AdminProductList';
import AdminBulkBar from './AdminBulkBar';
import AdminProductForm from './AdminProductForm';
import ConfirmDialog from './ConfirmDialog';

interface Props {
  collectionName: CollectionName;
}

export default function AdminCollectionView({ collectionName }: Props) {
  const { products, isLoading, save, remove, patch, bulkPatch } = useAdminProducts(collectionName);
  const { selected, toggle, selectMany, clear } = useAdminSelection();

  const [estado, setEstado] = useState<EstadoFilter>('todos');
  const [ml, setMl] = useState<MlFilter>('todos');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const stats = useMemo(() => computeStats(products), [products]);
  const byEstado = useMemo(() => filterByEstado(products, estado), [products, estado]);
  const byMl = useMemo(
    () => (collectionName === 'decants' ? filterByMl(byEstado, ml) : byEstado),
    [byEstado, ml, collectionName],
  );
  const visible = useMemo(() => searchProducts(byMl, search), [byMl, search]);
  const selectedProducts = useMemo(
    () => products.filter((p) => selected.has(p.id)),
    [products, selected],
  );

  async function handleToggleStock(p: Product) {
    const nuevoStock = p.stock === false;
    try {
      await patch(p.id, { stock: nuevoStock });
      showToast(nuevoStock ? '✅ Stock activado' : '🚫 Marcado como agotado');
    } catch {
      showToast('❌ Error al actualizar');
    }
  }

  async function handleDeleteConfirmed() {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setConfirmDelete(null);
    try {
      await remove(target.id);
      showToast('🗑️ Producto eliminado');
    } catch {
      showToast('❌ Error al eliminar');
    }
  }

  async function handleResetDiscount(id: number) {
    try {
      await patch(id, { precio_descuento: null });
      showToast('↺ Descuento eliminado');
    } catch {
      showToast('❌ Error al eliminar descuento');
    }
  }

  function openCreate() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditingProduct(p);
    setFormOpen(true);
  }

  function selectAllVisible() {
    selectMany(visible.map((p) => p.id));
  }

  function selectDiscounted() {
    const withDiscount = products.filter(hasActiveDiscount);
    if (withDiscount.length === 0) {
      showToast('Ningún producto tiene descuento activo');
      return;
    }
    selectMany(withDiscount.map((p) => p.id));
  }

  async function handleBulkDiscount(pct: number) {
    const count = selected.size;
    showToast(`⏳ Aplicando descuento a ${count} productos...`);
    try {
      await bulkPatch(Array.from(selected), (id) => {
        const p = products.find((x) => x.id === id);
        return p ? bulkDiscountFields(p, pct) : null;
      });
      showToast(`✅ Descuento aplicado a ${count} productos`);
      clear();
    } catch {
      showToast('❌ Error al aplicar descuentos');
    }
  }

  async function handleBulkPriceDelta(delta: number) {
    const count = selected.size;
    showToast(`⏳ Actualizando precios de ${count} productos...`);
    try {
      await bulkPatch(Array.from(selected), (id) => {
        const p = products.find((x) => x.id === id);
        return p ? bulkPriceDeltaFields(p, delta) : null;
      });
      const accion = delta > 0 ? 'aumentado' : 'reducido';
      showToast(`✅ Precio ${accion} en $${moneyARS(Math.abs(delta))} a ${count} productos`);
      clear();
    } catch {
      showToast('❌ Error al actualizar precios');
    }
  }

  async function handleBulkWholesale(price: number) {
    const count = selected.size;
    showToast(`⏳ Aplicando precio mayorista a ${count} productos...`);
    try {
      await bulkPatch(Array.from(selected), () => bulkWholesaleFields(price));
      showToast(`✅ Precio mayorista $${moneyARS(price)} aplicado a ${count} productos`);
      clear();
    } catch {
      showToast('❌ Error al aplicar precio mayorista');
    }
  }

  async function handleBulkReset() {
    const count = selected.size;
    if (count === 0) {
      showToast('⚠️ No hay productos seleccionados');
      return;
    }
    showToast(`⏳ Quitando descuento a ${count} productos...`);
    try {
      await bulkPatch(Array.from(selected), () => bulkResetDiscountFields());
      showToast(`✅ Descuento quitado a ${count} productos`);
      clear();
    } catch {
      showToast('❌ Error al quitar descuentos');
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-bold text-text">{COLLECTION_LABELS[collectionName]}</h2>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-bg transition hover:bg-gold-light"
        >
          <Plus size={16} /> Agregar
        </button>
      </div>

      <AdminStatsBar stats={stats} active={estado} onChange={setEstado} />

      <AdminFilters
        search={search}
        onSearchChange={setSearch}
        showMlFilter={collectionName === 'decants'}
        mlFilter={ml}
        onMlFilterChange={setMl}
        onSelectAllVisible={selectAllVisible}
        onSelectDiscounted={selectDiscounted}
        onClearSelection={clear}
      />

      <div className="mt-4">
        <AdminProductList
          products={visible}
          loading={isLoading}
          selected={selected}
          onToggleSelect={toggle}
          onEdit={openEdit}
          onToggleStock={handleToggleStock}
          onDelete={setConfirmDelete}
          onResetDiscount={handleResetDiscount}
        />
      </div>

      {selected.size > 0 && (
        <AdminBulkBar
          count={selected.size}
          selectedProducts={selectedProducts}
          onClose={clear}
          onApplyDiscountPct={handleBulkDiscount}
          onApplyPriceDelta={handleBulkPriceDelta}
          onApplyWholesale={handleBulkWholesale}
          onResetDiscounts={handleBulkReset}
        />
      )}

      {formOpen && (
        <AdminProductForm
          collectionName={collectionName}
          product={editingProduct}
          onSave={save}
          onClose={() => setFormOpen(false)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`¿Seguro que querés eliminar "${confirmDelete.nombre}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
