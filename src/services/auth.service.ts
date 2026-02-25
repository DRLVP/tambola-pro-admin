import api from './api';
import type { Roles } from '@/types/globals';

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    role: Roles;
    userId: string;
  };
}

/**
 * Auth service for role assignment and user synchronization
 */
export const authService = {
  /**
   * Assign admin role to user
   */
  async assignRole(data: {
    role: 'admin';
    clerkId: string;
    email: string;
    name: string;
  }): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/assign-role', data);
      console.log("response from assign role::", response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to assign role:', error);
      throw error;
    }
  },
  /**
   * Sync admin data with backend
   */
  async syncAdmin(adminData: {
    clerkId: string;
    email: string;
    name: string;
  }): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/sync-admin', adminData);
      console.log("response from sync admin::", response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to sync admin:', error);
      throw error;
    }
  },
};

export default authService;
