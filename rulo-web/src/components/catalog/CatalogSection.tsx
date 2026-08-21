import type { ReactNode } from 'react';

export function CatalogSection({
  id,
  title,
  action,
  children,
}: {
  id: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-bold sm:text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
