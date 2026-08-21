import { useEffect, useState } from 'react';

export function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
      className="animate-fade-in fixed bottom-[92px] right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-gold bg-bg text-gold shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-105 hover:bg-gold-bg active:scale-95"
    >
      ↑
    </button>
  );
}
