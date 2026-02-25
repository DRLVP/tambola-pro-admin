import api from './api';
import type { Game, ApiResponse, PaginatedResponse, CreateGameForm, DashboardStats } from '@/types';

export const gameService = {
  // Get all games with optional filters
  async getGames(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Game>> {
    const response = await api.get('/games', { params });
    return response.data;
  },

  // Get single game by ID
  async getGame(id: string): Promise<ApiResponse<Game>> {
    const response = await api.get(`/games/${id}`);
    return response.data;
  },

  // Get available games for lobby
  async getAvailableGames(): Promise<ApiResponse<Game[]>> {
    const response = await api.get('/games/available');
    return response.data;
  },

  // Get active/live games
  async getActiveGames(): Promise<ApiResponse<Game[]>> {
    const response = await api.get('/games/active');
    return response.data;
  },

  // Create new game (admin)
  async createGame(data: CreateGameForm): Promise<ApiResponse<Game>> {
    const response = await api.post('/games', data);
    return response.data;
  },

  // Update game (admin)
  async updateGame(id: string, data: Partial<CreateGameForm>): Promise<ApiResponse<Game>> {
    const response = await api.put(`/games/${id}`, data);
    return response.data;
  },

  // Delete game (admin)
  async deleteGame(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/games/${id}`);
    return response.data;
  },

  // Start game (admin)
  async startGame(id: string): Promise<ApiResponse<Game>> {
    const response = await api.post(`/games/${id}/start`);
    return response.data;
  },

  // End game (admin)
  async endGame(id: string): Promise<ApiResponse<Game>> {
    const response = await api.post(`/games/${id}/end`);
    return response.data;
  },

  // Pause game (admin)
  async pauseGame(id: string): Promise<ApiResponse<Game>> {
    const response = await api.post(`/games/${id}/pause`);
    return response.data;
  },

  // Resume game (admin)
  async resumeGame(id: string): Promise<ApiResponse<Game>> {
    const response = await api.post(`/games/${id}/resume`);
    return response.data;
  },

  // Call number (admin - for manual calling)
  async callNumber(id: string, number: number): Promise<ApiResponse<Game>> {
    const response = await api.post(`/games/${id}/call`, { number });
    return response.data;
  },

  // Start auto-play (admin)
  async startAutoPlay(id: string, interval: number = 3000): Promise<ApiResponse<Game>> {
    const response = await api.post(`/games/${id}/auto-play`, { interval });
    return response.data;
  },

  // Stop auto-play (admin)
  async stopAutoPlay(id: string): Promise<ApiResponse<Game>> {
    const response = await api.post(`/games/${id}/stop-auto-play`);
    return response.data;
  },

  // Get game results
  async getGameResults(id: string): Promise<ApiResponse<Game>> {
    const response = await api.get(`/games/${id}/results`);
    return response.data;
  },

  // Manual claim winner (admin)
  async manualClaim(id: string, ruleId: string, ticketId: string): Promise<ApiResponse<Game>> {
    const response = await api.post(`/games/${id}/manual-claim`, { ruleId, ticketId });
    return response.data;
  },

  // Get dashboard stats (admin)
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
};

export default gameService;
