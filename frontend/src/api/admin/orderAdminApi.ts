import axiosClient from '../axiosClient';
import type { Order, OrderStatus } from '../../types';

export const orderAdminApi = {
  getAllOrders: async (): Promise<Order[]> => {
    const response = await axiosClient.get<Order[]>('/admin/orders');
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
