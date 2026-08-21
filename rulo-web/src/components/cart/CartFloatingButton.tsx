interface CartFloatingButtonProps {
  count: number;
  onClick: () => void;
}

export function CartFloatingButton({ count, onClick }: CartFloatingButtonProps) {
  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ver carrito"
      className="animate-scale-in fixed bottom-6 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold shadow-lg shadow-gold/20 transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <span className="text-2xl">🛒</span>
      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-white">
        {count}
      </span>
    </button>
  );
}
