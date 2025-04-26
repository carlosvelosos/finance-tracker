'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowedUserIds?: string[];
  fallbackUrl?: string;
};

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  allowedUserIds = [],
  fallbackUrl = '/unauthorized'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip authorization checks for auth-related pages
    if (pathname.startsWith('/auth/')) {
      return;
    }

    if (!loading) {
      // Redirect to login if not authenticated
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      // If specific user restrictions are defined, verify the user's access
      if (allowedUserIds.length > 0) {
        const hasAccess = allowedUserIds.includes(user.id);
        if (!hasAccess) {
          console.log(`User ${user.id} not authorized to access ${pathname}`);
          router.push(fallbackUrl);
          return;
        }
      }
      
      // If role restrictions are defined, verify the user's role
      if (allowedRoles.length > 0) {
        const userRole = user.user_metadata?.role || 'standard';
        const hasRoleAccess = allowedRoles.includes(userRole);
        if (!hasRoleAccess) {
          console.log(`User role ${userRole} not authorized to access ${pathname}`);
          router.push(fallbackUrl);
          return;
        }
      }
    }
  }, [user, loading, router, pathname, allowedRoles, allowedUserIds, fallbackUrl]);

  // Show skeleton while loading
  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // Don't render anything if not authenticated for non-auth pages
  if (!user && !pathname.startsWith('/auth/')) {
    return null;
  }

  return <>{children}</>;
}