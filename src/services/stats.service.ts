import api from './api';
import { gameService } from './game.service';
import { userService } from './user.service';
import type { ApiResponse, DashboardStats } from '@/types';

export const statsService = {
  /**
   * Get dashboard summary statistics
   * Uses the backend dashboard stats endpoint, with fallback aggregation
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      // Try the dedicated backend endpoint first
      try {
        const response = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
      } catch (err) {
        console.warn('Backend dashboard stats failed, falling back to aggregation', err);
      }

      // Fallback: Aggregate from multiple endpoints
      const [gamesResponse, activeResponse, usersResponse] = await Promise.all([
        gameService.getGames({ limit: 1 }),
        gameService.getGames({ status: 'active', limit: 1 }),
        userService.getAllUsers({ role: 'user', limit: 1 })
      ]);

      const totalGames = gamesResponse.pagination?.total || 0;
      const activeGames = activeResponse.pagination?.total || 0;
      const totalUsers = usersResponse.pagination?.total || 0;

      return {
        totalUsers,
        totalGames,
        activeGames,
        totalRevenue: 0,
        todayRevenue: 0,
        recentGames: [],
        topWinners: [],
      };
    } catch (error) {
      console.error('Error aggregating dashboard stats:', error);
      throw error;
    }
  },
};
