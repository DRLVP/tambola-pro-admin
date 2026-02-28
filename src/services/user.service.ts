import api from './api';
import type { User, ApiResponse, PaginatedResponse } from '@/types';

export const userService = {
  // Admin: Get all users
  async getAllUsers(params?: { search?: string; role?: string; page?: number; limit?: number }): Promise<PaginatedResponse<User>> {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Admin: Get user by ID
  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Admin: Ban/unban user
  async toggleUserBan(id: string, banned: boolean): Promise<ApiResponse<User>> {
    const response = await api.post(`/users/${id}/ban`, { banned });
    return response.data;
  },

  // Admin: Delete user
  async deleteUser(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;
