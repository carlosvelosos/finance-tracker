'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
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
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Check authorization immediately and in useEffect
  useEffect(() => {
    // Skip authorization checks for auth-related pages
    if (pathname.startsWith('/auth/')) {
      setIsAuthorized(true);
      return;
    }

    if (!loading) {
      // Not authenticated
      if (!user) {
        setIsAuthorized(false);
        router.push('/auth/login');
        return;
      }
      
      // Check user ID restrictions
      if (allowedUserIds.length > 0) {
        const hasAccess = allowedUserIds.includes(user.id);
        if (!hasAccess) {
          console.log(`User ${user.id} not authorized to access ${pathname}`);
          setIsAuthorized(false);
          router.push(fallbackUrl);
          return;
        }
      }
      
      // Check role restrictions
      if (allowedRoles.length > 0) {
        const userRole = user.user_metadata?.role || 'standard';
        const hasRoleAccess = allowedRoles.includes(userRole);
        if (!hasRoleAccess) {
          console.log(`User role ${userRole} not authorized to access ${pathname}`);
          setIsAuthorized(false);
          router.push(fallbackUrl);
          return;
        }
      }
      
      // If we get here, the user is authorized
      setIsAuthorized(true);
    }
  }, [user, loading, router, pathname, allowedRoles, allowedUserIds, fallbackUrl]);

  // Early auth check - never render content until we know the user is authorized
  const checkAuthorizationSync = () => {
    // Always allow auth pages
    if (pathname.startsWith('/auth/')) {
      return true;
    }

    // If still loading or not determined yet, don't render content
    if (loading || isAuthorized === null) {
      return false;
    }

    // Use our auth state
    return isAuthorized;
  };

  // Loading state
  if (loading || isAuthorized === null) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // Don't render content if not authorized
  if (!checkAuthorizationSync()) {
    return null;
  }

  // Only render children if explicitly authorized
  return <>{children}</>;
}