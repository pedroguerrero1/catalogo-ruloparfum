import type { ReactNode } from 'react';
import clsx from 'clsx';

interface CartDrawerShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer: ReactNode;
}

export function CartDrawerShell({ open, onClose, title, children, footer }: CartDrawerShellProps) {
  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-gold/10 bg-panel shadow-2xl shadow-black/60 transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <h3 className="font-heading text-lg font-bold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card transition-colors hover:bg-danger-bg hover:text-danger"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">{children}</div>

        <div className="border-t border-border px-4 py-4">{footer}</div>
      </div>
    </>
  );
}
