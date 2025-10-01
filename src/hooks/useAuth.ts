'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

export const useAuth = () => {
  const { user, isAuthenticated } = useCurrentUser();
  const router = useRouter();

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirectedFrom=${encodeURIComponent(currentPath)}`);
      return false;
    }
    return true;
  }, [isAuthenticated, router]);

  return { user, isAuthenticated, requireAuth };
};
