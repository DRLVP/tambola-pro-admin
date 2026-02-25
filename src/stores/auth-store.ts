import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AdminUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin' | 'moderator' | 'user';
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  // State
  user: AdminUser | null;
  isAuthenticated: boolean;
  lastSyncedAt: number | null;

  // Actions
  setUser: (user: AdminUser) => void;
  updateUser: (updates: Partial<AdminUser>) => void;
  clearUser: () => void;
  isUserSynced: (clerkId: string) => boolean;
}

/**
 * Auth store for managing authenticated user data
 * - Persists to sessionStorage for tab-specific state
 * - Automatically clears on browser close
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      lastSyncedAt: null,

      // Set user data after successful authentication
      setUser: (user: AdminUser) => {
        set({
          user,
          isAuthenticated: true,
          lastSyncedAt: Date.now(),
        });
      },

      // Update user data partially
      updateUser: (updates: Partial<AdminUser>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({
          user: { ...currentUser, ...updates },
        });
      },

      // Clear user data (on logout)
      clearUser: () => {
        set({
          user: null,
          isAuthenticated: false,
          lastSyncedAt: null,
        });
      },

      // Check if user is already synced
      isUserSynced: (clerkId: string) => {
        const { user } = get();
        return user?.clerkId === clerkId;
      },
    }),
    {
      name: 'tambola-admin-auth',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// Selectors for common use cases
export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthActions = () => useAuthStore((state) => ({
  setUser: state.setUser,
  updateUser: state.updateUser,
  clearUser: state.clearUser,
  isUserSynced: state.isUserSynced,
}));
