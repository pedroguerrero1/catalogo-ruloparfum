import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { LogOut } from 'lucide-react';
import type { CollectionName } from '@/types/product';
import { logout } from '@/firebase/auth';
import AdminTabs from './AdminTabs';
import AdminToastViewport from './AdminToastViewport';

interface Props {
  user: User;
  activeTab: CollectionName;
  onTabChange: (tab: CollectionName) => void;
  children: ReactNode;
}

export default function AdminLayout({ user, activeTab, onTabChange, children }: Props) {
  return (
    <div className="min-h-screen bg-bg pb-28">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-panel/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex items-center gap-2 font-heading text-lg font-bold text-gold">
          <span aria-hidden>⚙️</span>
          <span>Rulo Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[14rem] truncate text-sm text-muted sm:inline">
            {user.email}
          </span>
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition hover:border-danger hover:text-danger"
          >
            <LogOut size={16} />
            <span>Salir</span>
          </button>
        </div>
      </header>

      <nav className="sticky top-[57px] z-20 border-b border-border bg-bg">
        <AdminTabs active={activeTab} onChange={onTabChange} />
      </nav>

      <main className="mx-auto max-w-6xl px-3 py-4 md:px-6 md:py-6">{children}</main>

      <AdminToastViewport />
    </div>
  );
}
