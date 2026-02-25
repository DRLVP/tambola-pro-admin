// Zustand Stores
import { useAuthStore } from './auth-store';
import { useAdminStatsStore } from './admin-stats-store';
import { useGameStore } from './game-store';
import { useSocketStore } from './socket-store';

// Auth Store
export {
  useAuthStore,
  useCurrentUser,
  useIsAuthenticated,
  useAuthActions,
  type AdminUser
} from './auth-store';

// Admin Stats Store
export {
  useAdminStatsStore,
  useDashboardStats,
  useStatsLoading,
  useStatsError,
  useStatsActions
} from './admin-stats-store';

// Game Store
export {
  useGameStore,
  useCurrentGame,
  useMyTickets,
  useCalledNumbers,
  useMarkedNumbers,
  useLastCalledNumber,
  useIsGameActive,
  useGameActions
} from './game-store';

// Socket Store
export {
  useSocketStore,
  useSocket,
  useIsSocketConnected,
  useSocketActions
} from './socket-store';

/**
 * Clear all Zustand stores
 * Call this on logout to reset application state
 */
export const clearAllStores = () => {
  try {
    // Access stores synchronously and clear them
    useAuthStore.getState().clearUser();
    useAdminStatsStore.getState().clearStats();
    useGameStore.getState().resetGame();
    useSocketStore.getState().disconnectSocket();

    console.log('✨ All stores cleared');
  } catch (error) {
    console.error('❌ Error clearing stores:', error);
  }
};
