import api from './api';
import type { User, ApiResponse, PaginatedResponse } from '@/types';

export const userService = {
  // Admin: Get all users
  async getAllUsers(params?: { search?: string; role?: string; page?: number; limit?: number }): Promise<PaginatedResponse<User>> {
    const response = await api.get('/users', { params }); // Changed from /admin/users
    return response.data;
  },

  // Admin: Get user by ID
  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await api.get(`/users/${id}`); // Changed from /admin/users/${id}
    return response.data;
  },

  // Admin: Update user
  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await api.put(`/users/${id}`, data); // Changed from /admin/users/${id}
    return response.data;
  },

  // Admin: Ban/unban user
  async toggleUserBan(id: string, banned: boolean): Promise<ApiResponse<User>> {
    const response = await api.post(`/users/${id}/ban`, { banned }); // Changed from /admin/users/${id}/ban
    return response.data;
  },

  // Admin: Delete user
  async deleteUser(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/users/${id}`); // Changed from /admin/users/${id}
    return response.data;
  },
};

export default userService;
