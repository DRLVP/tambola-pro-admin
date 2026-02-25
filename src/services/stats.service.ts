import api from './api';
import { gameService } from './game.service';
import { userService } from './user.service';
import type { ApiResponse, DashboardStats } from '@/types';

// Report Data Types
export interface RevenueData {
  month: string;
  revenue: number;
  games: number;
}

export interface PlayerData {
  month: string;
  newUsers: number;
  activeUsers: number;
}

export interface PrizeDistributionData {
  name: string;
  value: number;
  color: string;
}

export interface GamePerformanceData {
  name: string;
  players: number;
  revenue: number;
}

export interface ReportStats {
  revenueData: RevenueData[];
  playerData: PlayerData[];
  prizeDistribution: PrizeDistributionData[];
  topGames: GamePerformanceData[];
}

export const statsService = {
  /**
   * Get dashboard summary statistics
   * Manually aggregated from various services due to backend limitations
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      // Run requests in parallel for performance
      const [gamesResponse, activeResponse, usersResponse] = await Promise.all([
        // Get total games
        gameService.getGames({ limit: 1 }),
        // Get active games
        gameService.getGames({ status: 'active', limit: 1 }),
        // Get total players (users with role='user')
        userService.getAllUsers({ role: 'user', limit: 1 })
      ]);

      const totalGames = gamesResponse.pagination?.total || 0;
      const activeGames = activeResponse.pagination?.total || 0;
      const totalUsers = usersResponse.pagination?.total || 0;

      // Note: Revenue and recent games might need real backend endpoints or further calculation
      // For now, we'll try to get them from the original stats endpoint if it returns partial data,
      // or default to 0/empty.
      let originalStats: Partial<DashboardStats> = {};
      try {
        const response = await api.get<ApiResponse<DashboardStats>>('/admin/stats/dashboard');
        if (response.data.success && response.data.data) {
          originalStats = response.data.data;
        }
      } catch (err) {
        // Ignore stats endpoint error if it fails
        console.warn('Backend stats endpoint failed, using aggregated data', err);
      }

      return {
        totalUsers,
        totalGames,
        activeGames,
        totalRevenue: originalStats.totalRevenue || 0,
        todayRevenue: originalStats.todayRevenue || 0,
        recentGames: originalStats.recentGames || [],
        topWinners: originalStats.topWinners || [],
      };
    } catch (error) {
      console.error('Error aggregating dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get advanced reports data
   * @param timeRange The time range filter (7days, 30days, 6months, 1year)
   */
  getReports: async (timeRange: string = '6months'): Promise<ReportStats> => {
    const response = await api.get<ApiResponse<ReportStats>>(`/admin/stats/reports?range=${timeRange}`);
    return response.data.data;
  },
};
