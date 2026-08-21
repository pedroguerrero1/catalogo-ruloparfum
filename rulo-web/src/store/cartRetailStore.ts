import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartRetailState {
  ids: number[];
  toggle: (id: number) => void;
  remove: (id: number) => void;
  clear: () => void;
}

export const useCartRetailStore = create<CartRetailState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((i) => i !== id) : [...s.ids, id],
        })),
      remove: (id) => set((s) => ({ ids: s.ids.filter((i) => i !== id) })),
      clear: () => set({ ids: [] }),
    }),
    { name: 'rulo-retail-cart' },
  ),
);
