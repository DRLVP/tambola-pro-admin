import api from './api';
import type { Ticket, ApiResponse, PaginatedResponse, PurchaseTicketForm } from '@/types';

export const ticketService = {
  // Get user's tickets
  async getMyTickets(params?: {
    gameId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Ticket>> {
    const response = await api.get('/tickets/my', { params });
    return response.data;
  },

  // Get ticket by ID
  async getTicket(id: string): Promise<ApiResponse<Ticket>> {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  // Get tickets for a specific game (Admin)
  async getGameTickets(gameId: string): Promise<PaginatedResponse<Ticket>> {
    const response = await api.get(`/tickets/game/${gameId}`);
    return response.data;
  },

  // Purchase tickets
  async purchaseTickets(data: PurchaseTicketForm): Promise<ApiResponse<Ticket[]>> {
    const response = await api.post('/tickets/purchase', data);
    return response.data;
  },

  // Mark number on ticket
  async markNumber(ticketId: string, number: number): Promise<ApiResponse<Ticket>> {
    const response = await api.post(`/tickets/${ticketId}/mark`, { number });
    return response.data;
  },

  // Claim prize
  async claimPrize(ticketId: string, prizePattern: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const response = await api.post(`/tickets/${ticketId}/claim`, { prizePattern });
    return response.data;
  },

  // Admin: Get all tickets
  async getAllTickets(params?: {
    gameId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Ticket>> {
    const response = await api.get('/tickets', { params });
    return response.data;
  },

  // Admin: Get pending tickets
  async getPendingTickets(gameId?: string): Promise<PaginatedResponse<Ticket>> {
    const response = await api.get('/tickets/pending', { params: { gameId } });
    return response.data;
  },

  // Admin: Confirm ticket (pending → active)
  async confirmTicket(ticketId: string): Promise<ApiResponse<Ticket>> {
    const response = await api.post(`/tickets/${ticketId}/confirm`);
    return response.data;
  },

  // Admin: Cancel ticket
  async cancelTicket(ticketId: string): Promise<ApiResponse<Ticket>> {
    const response = await api.post(`/tickets/${ticketId}/cancel`);
    return response.data;
  },
};

export default ticketService;
