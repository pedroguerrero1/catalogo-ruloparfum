import { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import type { CollectionName, Product } from '@/types/product';
import { uploadProductImage } from '@/firebase/storage';
import { showToast } from '@/hooks/useAdminToast';
import AdminImageUpload from './AdminImageUpload';

interface Props {
  collectionName: CollectionName;
  /** null = alta (nuevo producto), Product = edición. */
  product: Product | null;
  onSave: (data: Product) => Promise<void>;
  onClose: () => void;
}

type GeneroOption = 'unisex' | 'hombre' | 'mujer';
type LineaOption = 'arabe' | 'disenador';

function recomputeDiscount(precioStr: string, pctStr: string): string | null {
  const precio = parseFloat(precioStr);
  const pct = parseFloat(pctStr);
  if (precio > 0 && pct > 0 && pct < 100) {
    return String(Math.round(precio * (1 - pct / 100)));
  }
  return null;
}

/** Strips a trailing " 10ML" suffix so both variants share the same base name. */
function baseDecantName(nombre: string): string {
  return nombre.replace(/\s*10\s*ml$/i, '').trim();
}

function decantNameForMl(nombre: string, ml: '5' | '10'): string {
  const base = baseDecantName(nombre);
  return ml === '10' ? `${base} 10ML` : base;
}

export default function AdminProductForm({ collectionName, product, onSave, onClose }: Props) {
  const editing = Boolean(product);

  const [nombre, setNombre] = useState(product?.nombre ?? '');
  const [marca, setMarca] = useState(product?.marca ?? '');
  const [genero, setGenero] = useState<GeneroOption>(
    ((product?.genero ?? 'unisex').toLowerCase() as GeneroOption) || 'unisex',
  );
  const [ml, setMl] = useState(product?.ml ? String(product.ml) : '');
  const [precio, setPrecio] = useState(product?.precio ? String(product.precio) : '');
  const [descuentoPct, setDescuentoPct] = useState('');
  const [precioDescuento, setPrecioDescuento] = useState(
    product?.precio_descuento ? String(product.precio_descuento) : '',
  );
  const [precioMayorista, setPrecioMayorista] = useState(
    product?.precio_mayorista ? String(product.precio_mayorista) : '',
  );
  const [linea, setLinea] = useState<LineaOption>((product?.linea as LineaOption) ?? 'arabe');
  const [tipo, setTipo] = useState(product?.tipo ?? 'EDP');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [descripcion, setDescripcion] = useState(product?.descripcion ?? '');
  const [notasSalida, setNotasSalida] = useState(product?.notas_salida ?? '');
  const [notasCorazon, setNotasCorazon] = useState(product?.notas_corazon ?? '');
  const [notasFondo, setNotasFondo] = useState(product?.notas_fondo ?? '');
  const [stock, setStock] = useState(product?.stock !== false);
  const [activo, setActivo] = useState(product?.activo !== false);
  const [saving, setSaving] = useState(false);

  const [alsoOtherMl, setAlsoOtherMl] = useState(false);
  const [otroMlPrecio, setOtroMlPrecio] = useState('');

  const otherMl: '5' | '10' | null = ml === '5' ? '10' : ml === '10' ? '5' : null;
  const showDecantDuplicate = collectionName === 'decants' && !editing && otherMl !== null;
  const showNotes = !['decants', 'cremas', 'vapers'].includes(collectionName);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !saving) onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, saving]);

  function handlePrecioChange(value: string) {
    setPrecio(value);
    const next = recomputeDiscount(value, descuentoPct);
    if (next !== null) setPrecioDescuento(next);
  }

  function handlePctChange(value: string) {
    setDescuentoPct(value);
    const next = recomputeDiscount(precio, value);
    if (next !== null) setPrecioDescuento(next);
  }

  function handleResetDescuento() {
    setPrecioDescuento('');
    setDescuentoPct('');
  }

  async function handleSubmit() {
    const precioNum = parseFloat(precio);
    if (!nombre.trim() || !precioNum) {
      showToast('⚠️ Nombre y precio son obligatorios');
      return;
    }

    const duplicateOtherMl = showDecantDuplicate && alsoOtherMl;
    const otroPrecioNum = parseFloat(otroMlPrecio);
    if (duplicateOtherMl && !otroPrecioNum) {
      showToast(`⚠️ Ingresá el precio para la versión de ${otherMl}ml`);
      return;
    }

    setSaving(true);

    let imagen = product?.imagen ?? '';
    const pastedUrl = imageUrl.trim();
    try {
      if (pastedUrl.startsWith('http')) {
        imagen = pastedUrl;
      } else if (imageFile) {
        imagen = await uploadProductImage(collectionName, imageFile);
      }
    } catch {
      showToast('❌ Error al subir la imagen');
      setSaving(false);
      return;
    }

    const id = product?.id ?? Date.now();
    const precioDescuentoNum = parseFloat(precioDescuento);
    const precioMayoristaNum = parseFloat(precioMayorista);

    const data: Product = {
      id,
      nombre: nombre.trim(),
      marca: marca.trim(),
      genero,
      ml: parseInt(ml, 10) || 0,
      tipo: tipo.trim(),
      precio: precioNum,
      precio_descuento: precioDescuentoNum ? precioDescuentoNum : null,
      precio_mayorista: precioMayoristaNum ? precioMayoristaNum : null,
      linea,
      imagen,
      descripcion: descripcion.trim(),
      notas_salida: notasSalida.trim(),
      notas_corazon: notasCorazon.trim(),
      notas_fondo: notasFondo.trim(),
      stock,
      activo,
    };

    try {
      await onSave(data);

      if (duplicateOtherMl && otherMl) {
        const dataOtro: Product = {
          ...data,
          id: id + 1,
          ml: parseInt(otherMl, 10),
          nombre: decantNameForMl(nombre, otherMl),
          precio: otroPrecioNum,
          precio_descuento: null,
          precio_mayorista: null,
        };
        await onSave(dataOtro);
        showToast(`✅ 2 productos agregados (${ml}ml y ${otherMl}ml)`);
      } else {
        showToast(editing ? '✅ Producto actualizado' : '✅ Producto agregado');
      }

      onClose();
    } catch {
      showToast('❌ Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-text outline-none focus:border-gold';
  const labelClass = 'mb-1.5 block text-xs font-semibold text-muted';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center md:p-4"
      onClick={() => !saving && onClose()}
    >
      <div
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border-t border-border bg-panel md:max-w-lg md:rounded-2xl md:border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-border md:hidden" />
            <h3 className="font-heading text-lg font-bold text-text">
              {editing ? 'Editar producto' : 'Agregar producto'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => !saving && onClose()}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition hover:border-danger hover:text-danger"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelClass}>Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Xerjoff Erba Pura"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Marca</label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Xerjoff"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Género</label>
              <select
                value={genero}
                onChange={(e) => setGenero(e.target.value as GeneroOption)}
                className={inputClass}
              >
                <option value="unisex">Unisex</option>
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>ML</label>
              <input
                type="number"
                value={ml}
                onChange={(e) => setMl(e.target.value)}
                placeholder="100"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Precio</label>
              <input
                type="number"
                value={precio}
                onChange={(e) => handlePrecioChange(e.target.value)}
                placeholder="150000"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Descuento %</label>
              <input
                type="number"
                min={0}
                max={99}
                value={descuentoPct}
                onChange={(e) => handlePctChange(e.target.value)}
                placeholder="Ej: 10"
                className={inputClass}
              />
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Precio con descuento</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={precioDescuento}
                  onChange={(e) => setPrecioDescuento(e.target.value)}
                  placeholder="Se calcula solo"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleResetDescuento}
                  className="flex shrink-0 items-center gap-1 rounded-xl border border-danger/30 bg-danger-bg px-3 py-2.5 text-xs font-bold text-danger transition hover:opacity-80"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>
            </div>

            {showDecantDuplicate ? (
              <div className="col-span-2 rounded-xl border border-gold/30 bg-gold-bg px-3 py-3">
                <label className="flex items-center justify-between gap-2 text-sm font-semibold text-gold">
                  Crear también la versión de {otherMl}ml
                  <input
                    type="checkbox"
                    checked={alsoOtherMl}
                    onChange={(e) => setAlsoOtherMl(e.target.checked)}
                    className="h-5 w-5 accent-gold"
                  />
                </label>
                {alsoOtherMl ? (
                  <div className="mt-2">
                    <label className={labelClass}>Precio ({otherMl}ml)</label>
                    <input
                      type="number"
                      value={otroMlPrecio}
                      onChange={(e) => setOtroMlPrecio(e.target.value)}
                      placeholder="Ej: 12000"
                      className={inputClass}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            <div>
              <label className={labelClass}>Precio mayorista</label>
              <input
                type="number"
                value={precioMayorista}
                onChange={(e) => setPrecioMayorista(e.target.value)}
                placeholder="Opcional"
                className={inputClass}
              />
            </div>

            {collectionName === 'perfumes' && (
              <div>
                <label className={labelClass}>Línea</label>
                <select
                  value={linea}
                  onChange={(e) => setLinea(e.target.value as LineaOption)}
                  className={inputClass}
                >
                  <option value="arabe">Árabe</option>
                  <option value="disenador">Diseñador</option>
                </select>
              </div>
            )}

            <div className={collectionName === 'perfumes' ? '' : 'col-span-2'}>
              <label className={labelClass}>Tipo (EDP/EDT)</label>
              <input
                type="text"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                placeholder="EDP / EDT"
                className={inputClass}
              />
            </div>

            <div className="col-span-2 flex gap-4 rounded-xl border border-border bg-card px-3 py-2.5">
              <label className="flex flex-1 items-center justify-between gap-2 text-sm text-text">
                Con stock
                <input
                  type="checkbox"
                  checked={stock}
                  onChange={(e) => setStock(e.target.checked)}
                  className="h-5 w-5 accent-gold"
                />
              </label>
              <label className="flex flex-1 items-center justify-between gap-2 text-sm text-text">
                Activo
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="h-5 w-5 accent-gold"
                />
              </label>
            </div>

            <div className="col-span-2">
              <AdminImageUpload
                currentImage={product?.imagen}
                file={imageFile}
                url={imageUrl}
                onFileChange={setImageFile}
                onUrlChange={setImageUrl}
              />
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del perfume..."
                rows={3}
                className={inputClass}
              />
            </div>

            {showNotes ? (
              <>
                <div className="col-span-2">
                  <label className={labelClass}>Notas de salida</label>
                  <input
                    type="text"
                    value={notasSalida}
                    onChange={(e) => setNotasSalida(e.target.value)}
                    placeholder="Bergamota, naranja..."
                    className={inputClass}
                  />
                </div>

                <div className="col-span-2">
                  <label className={labelClass}>Notas de corazón</label>
                  <input
                    type="text"
                    value={notasCorazon}
                    onChange={(e) => setNotasCorazon(e.target.value)}
                    placeholder="Rosa, jazmín..."
                    className={inputClass}
                  />
                </div>

                <div className="col-span-2">
                  <label className={labelClass}>Notas de fondo</label>
                  <input
                    type="text"
                    value={notasFondo}
                    onChange={(e) => setNotasFondo(e.target.value)}
                    placeholder="Ámbar, vainilla..."
                    className={inputClass}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={() => !saving && onClose()}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-text transition hover:bg-card"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-xl bg-gold py-3 text-sm font-semibold text-bg transition hover:bg-gold-light disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
