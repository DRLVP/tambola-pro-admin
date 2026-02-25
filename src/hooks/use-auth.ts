import { useAuth, useUser, useSession } from '@clerk/clerk-react';
import { useCallback, useMemo } from 'react';
import type { Roles } from '@/types/globals';

/**
 * Custom authentication hook with role-based utilities
 * Provides easy access to user role and authentication state
 */
export function useAuthWithRole() {
  const { isLoaded, isSignedIn, userId, signOut, getToken } = useAuth();
  const { user } = useUser();
  const { session } = useSession();

  // Get role from session claims (publicMetadata)
  const role = useMemo((): Roles | undefined => {
    if (!session?.publicUserData) return undefined;

    // Access role from publicMetadata via session claims
    const claims = session as unknown as { publicUserData?: { metadata?: { role?: Roles } } };
    return claims.publicUserData?.metadata?.role;
  }, [session]);

  // Alternative: Get role directly from user's publicMetadata
  const userRole = useMemo((): Roles | undefined => {
    return user?.publicMetadata?.role as Roles | undefined;
  }, [user?.publicMetadata?.role]);

  // Use userRole as fallback if session role is not available
  const currentRole = role || userRole;

  const isAdmin = useMemo(() => currentRole === 'admin', [currentRole]);

  const checkRole = useCallback((requiredRole: Roles): boolean => {
    return currentRole === requiredRole;
  }, [currentRole]);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return {
    // Auth state
    isLoaded,
    isSignedIn,
    userId,
    user,
    session,

    // Role utilities
    role: currentRole,
    isAdmin,
    checkRole,

    // Actions
    signOut: handleSignOut,
    getToken,
  };
}

/**
 * Hook to check if current user has a specific role
 */
export function useRoleCheck(requiredRole: Roles): {
  hasRole: boolean;
  isLoading: boolean;
  isSignedIn: boolean;
} {
  const { isLoaded, isSignedIn, role } = useAuthWithRole();

  return {
    hasRole: role === requiredRole,
    isLoading: !isLoaded,
    isSignedIn: isSignedIn ?? false,
  };
}

/**
 * Hook to check if current user is an admin
 */
export function useIsAdmin(): {
  isAdmin: boolean;
  isLoading: boolean;
  isSignedIn: boolean;
} {
  const result = useRoleCheck('admin');
  return {
    isAdmin: result.hasRole,
    isLoading: result.isLoading,
    isSignedIn: result.isSignedIn,
  };
}

export default useAuthWithRole;
