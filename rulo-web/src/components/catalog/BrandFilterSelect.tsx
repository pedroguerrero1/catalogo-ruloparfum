interface BrandFilterSelectProps {
  brands: string[];
  selected: string | null;
  onSelect: (brand: string | null) => void;
}

export function BrandFilterSelect({ brands, selected, onSelect }: BrandFilterSelectProps) {
  if (brands.length <= 1) return null;

  return (
    <select
      value={selected ?? 'all'}
      onChange={(e) => onSelect(e.target.value === 'all' ? null : e.target.value)}
      className="min-h-9 rounded-xl border border-border bg-card px-2.5 text-xs font-semibold text-text focus:border-gold focus:outline-none sm:text-sm"
    >
      <option value="all">Todas las marcas</option>
      {brands.map((b) => (
        <option key={b} value={b}>
          {b}
        </option>
      ))}
    </select>
  );
}
