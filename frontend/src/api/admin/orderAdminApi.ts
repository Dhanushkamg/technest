import axiosClient from '../axiosClient';
import type { Order, OrderStatus } from '../../types';

export const orderAdminApi = {
  getAllOrders: async (status?: OrderStatus, search?: string): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search && search.trim()) params.append('search', search.trim());

    const queryString = params.toString();
    const url = `/admin/orders${queryString ? `?${queryString}` : ''}`;
    const response = await axiosClient.get<Order[]>(url);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: OrderStatus): Promise<Order> => {
    const response = await axiosClient.put<Order>(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  cancelOrder: async (id: number): Promise<Order> => {
    const response = await axiosClient.post<Order>(`/admin/orders/${id}/cancel`);
    return response.data;
  },
};

export default orderAdminApi;
