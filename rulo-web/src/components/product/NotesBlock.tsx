import type { Product } from '@/types/product';
import { capitalizeNotes } from '@/utils/text';

export function NotesBlock({ product }: { product: Product }) {
  const { notas_salida, notas_corazon, notas_fondo } = product;
  if (!notas_salida && !notas_corazon && !notas_fondo) return null;

  return (
    <div className="space-y-1.5 rounded-xl bg-panel/60 p-3 text-sm">
      {notas_salida ? (
        <p>
          <strong className="text-gold">Salida:</strong> {capitalizeNotes(notas_salida)}
        </p>
      ) : null}
      {notas_corazon ? (
        <p>
          <strong className="text-gold">Corazón:</strong> {capitalizeNotes(notas_corazon)}
        </p>
      ) : null}
      {notas_fondo ? (
        <p>
          <strong className="text-gold">Fondo:</strong> {capitalizeNotes(notas_fondo)}
        </p>
      ) : null}
    </div>
  );
}
