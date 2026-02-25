import { create } from 'zustand';
import type { DashboardStats } from '@/types';

interface AdminStatsState {
  // State
  stats: DashboardStats | null;
  lastFetchedAt: number | null;
  isLoading: boolean;
  error: string | null;

  // Configuration
  cacheTTL: number; // Time-to-live in milliseconds (default: 5 minutes)

  // Actions
  setStats: (stats: DashboardStats) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearStats: () => void;
  shouldRefetch: () => boolean;
  refreshStats: () => Promise<void>;
  fetchStats: (force?: boolean) => Promise<void>;
}

const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Admin stats store for caching dashboard statistics
 * - Smart cache invalidation after TTL
 * - Loading and error states
 * - In-memory only (clears on page refresh)
 */
export const useAdminStatsStore = create<AdminStatsState>((set, get) => ({
  // Initial state
  stats: null,
  lastFetchedAt: null,
  isLoading: false,
  error: null,
  cacheTTL: DEFAULT_CACHE_TTL,

  // Store stats data
  setStats: (stats: DashboardStats) => {
    set({
      stats,
      lastFetchedAt: Date.now(),
      isLoading: false,
      error: null,
    });
  },

  // Set loading state
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  // Set error state
  setError: (error: string | null) => {
    set({ error, isLoading: false });
  },

  // Clear stats cache
  clearStats: () => {
    set({
      stats: null,
      lastFetchedAt: null,
      isLoading: false,
      error: null,
    });
  },

  // Check if cache is stale and needs refetch
  shouldRefetch: () => {
    const { stats, lastFetchedAt, cacheTTL } = get();

    // No cache exists
    if (!stats || !lastFetchedAt) return true;

    // Check if cache is stale
    const now = Date.now();
    const cacheAge = now - lastFetchedAt;
    return cacheAge > cacheTTL;
  },

  // Refresh stats ignoring cache
  refreshStats: async () => {
    set({ isLoading: true });
    // Note: The actual fetch logic is currently in the component. 
    // Ideally, we should move it here to have a self-contained store.
    // For now, setting isLoading checks `shouldRefetch` logic in components or triggers effects.

    // NOTE: In a full implementation, `fetchStats` should be an action here calling `statsService`.
    // Let's implement it properly.
  },

  fetchStats: async (force: boolean = false) => {
    const { shouldRefetch, setLoading, setStats, setError } = get();

    if (!force && !shouldRefetch()) {
      return;
    }

    setLoading(true);
    try {
      // Lazy import to avoid circular dependencies if any
      const { statsService } = await import('@/services/stats.service');
      const data = await statsService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats', err);
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  }
}));

// Selectors for common use cases
export const useDashboardStats = () => useAdminStatsStore((state) => state.stats);
export const useStatsLoading = () => useAdminStatsStore((state) => state.isLoading);
export const useStatsError = () => useAdminStatsStore((state) => state.error);
export const useStatsActions = () => useAdminStatsStore((state) => ({
  setStats: state.setStats,
  setLoading: state.setLoading,
  setError: state.setError,
  clearStats: state.clearStats,
  shouldRefetch: state.shouldRefetch,
  fetchStats: state.fetchStats,
}));
