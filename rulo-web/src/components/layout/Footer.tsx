export function Footer({ variant }: { variant: 'retail' | 'wholesale' }) {
  return (
    <footer className="relative mt-10 py-10 text-center">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <p className="font-heading text-sm font-bold tracking-wide text-gold">RULO Parfum</p>
      <p className="mt-1.5 text-xs text-muted">
        © {new Date().getFullYear()} Rulo BarberShop —{' '}
        {variant === 'wholesale' ? 'Catálogo Mayorista Exclusivo' : 'Barbería y Perfumería'}
      </p>
    </footer>
  );
}
