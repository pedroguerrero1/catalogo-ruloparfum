import { useCallback, useState } from 'react';

/** Tracks the set of selected product ids for bulk actions. */
export function useAdminSelection() {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectMany = useCallback((ids: number[]) => setSelected(new Set(ids)), []);
  const clear = useCallback(() => setSelected(new Set()), []);

  return { selected, toggle, selectMany, clear };
}
