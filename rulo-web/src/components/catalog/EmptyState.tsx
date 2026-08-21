import { PackageSearch } from 'lucide-react';

export function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/50 py-16 text-center">
      <PackageSearch className="h-10 w-10 text-muted/60" strokeWidth={1.5} />
      <p className="text-sm text-muted">{message || 'No se encontraron productos con esos filtros.'}</p>
    </div>
  );
}
