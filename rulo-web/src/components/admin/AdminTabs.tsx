import { clsx } from 'clsx';
import { COLLECTIONS, type CollectionName } from '@/types/product';
import { COLLECTION_LABELS } from '@/utils/adminFilters';

interface Props {
  active: CollectionName;
  onChange: (tab: CollectionName) => void;
}

export default function AdminTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto px-2 [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden">
      {COLLECTIONS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={clsx(
            'shrink-0 whitespace-nowrap border-b-2 px-4 py-3 font-heading text-sm font-semibold transition-colors',
            active === tab
              ? 'border-gold text-gold'
              : 'border-transparent text-muted hover:text-text',
          )}
        >
          {COLLECTION_LABELS[tab]}
        </button>
      ))}
    </div>
  );
}
