import clsx from 'clsx';
import type { MinimumCheck } from '@/utils/wholesaleMinimum';

export function MinimumOrderNotice({ check }: { check: MinimumCheck }) {
  if (!check.msg) return null;

  return (
    <div
      className={clsx(
        'mb-3 rounded-lg px-3 py-2 text-center text-xs font-semibold',
        check.ok ? 'bg-wa-bg text-wa' : 'bg-danger-bg text-danger',
      )}
    >
      {check.msg}
    </div>
  );
}
