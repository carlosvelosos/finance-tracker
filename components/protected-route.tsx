'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !pathname.startsWith('/auth/')) {
      router.push('/auth/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!user && !pathname.startsWith('/auth/')) {
    return null;
  }

  return <>{children}</>;
}