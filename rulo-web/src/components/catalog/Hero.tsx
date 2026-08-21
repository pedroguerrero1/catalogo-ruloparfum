import type { ReactNode } from 'react';

export function Hero({ title, subtitle }: { title: string; subtitle: ReactNode }) {
  return (
    <section className="py-9 text-center sm:py-14">
      <div className="mx-auto mb-4 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
      <h1 className="bg-gradient-to-b from-white to-white/70 bg-clip-text font-heading text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl md:text-4xl">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted sm:text-base">{subtitle}</p>
    </section>
  );
}
