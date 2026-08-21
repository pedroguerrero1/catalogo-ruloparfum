import { clsx } from 'clsx';
import { useAdminToast } from '@/hooks/useAdminToast';

export default function AdminToastViewport() {
  const toast = useAdminToast();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex justify-center px-4">
      <div
        className={clsx(
          'pointer-events-none max-w-[92vw] rounded-full border border-border bg-panel px-5 py-3 text-center text-sm font-medium text-text shadow-lg shadow-black/40 transition-all duration-200',
          toast ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        )}
      >
        {toast?.message ?? ''}
      </div>
    </div>
  );
}
