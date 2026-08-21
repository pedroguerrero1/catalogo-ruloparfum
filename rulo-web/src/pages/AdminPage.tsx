import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { watchAuthState } from '@/firebase/auth';
import type { CollectionName } from '@/types/product';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminCollectionView from '@/components/admin/AdminCollectionView';

export default function AdminPage() {
  // undefined = auth state still resolving, null = logged out.
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<CollectionName>('perfumes');

  useEffect(() => watchAuthState(setUser), []);

  if (user === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-gold" />
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      <AdminCollectionView key={activeTab} collectionName={activeTab} />
    </AdminLayout>
  );
}
