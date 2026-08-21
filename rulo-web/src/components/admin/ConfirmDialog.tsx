import { useEffect } from 'react';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = true,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-panel p-5 shadow-xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-bold text-text">{title}</h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-text transition hover:bg-card"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              danger
                ? 'flex-1 rounded-xl bg-danger py-2.5 text-sm font-semibold text-white transition hover:opacity-90'
                : 'flex-1 rounded-xl bg-gold py-2.5 text-sm font-semibold text-bg transition hover:bg-gold-light'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
