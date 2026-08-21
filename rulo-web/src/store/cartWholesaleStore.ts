import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CollectionName } from '@/types/product';

export interface WholesaleCartLine {
  cant: number;
  seccion: CollectionName;
}

interface CartWholesaleState {
  items: Record<number, WholesaleCartLine>;
  add: (id: number, seccion: CollectionName) => void;
  changeQty: (id: number, delta: number) => void;
  remove: (id: number) => void;
  clear: () => void;
}

export const useCartWholesaleStore = create<CartWholesaleState>()(
  persist(
    (set) => ({
      items: {},
      add: (id, seccion) =>
        set((s) => {
          const current = s.items[id];
          return {
            items: {
              ...s.items,
              [id]: { cant: (current?.cant ?? 0) + 1, seccion },
            },
          };
        }),
      changeQty: (id, delta) =>
        set((s) => {
          const current = s.items[id];
          if (!current) return s;
          const nextCant = current.cant + delta;
          const items = { ...s.items };
          if (nextCant <= 0) {
            delete items[id];
          } else {
            items[id] = { ...current, cant: nextCant };
          }
          return { items };
        }),
      remove: (id) =>
        set((s) => {
          const items = { ...s.items };
          delete items[id];
          return { items };
        }),
      clear: () => set({ items: {} }),
    }),
    { name: 'rulo-wholesale-cart' },
  ),
);
