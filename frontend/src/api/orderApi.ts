import axiosClient from './axiosClient';
import type { CreateOrderRequest, Order, UpdateOrderStatusRequest } from '../types';

export const orderApi = {
  createOrder: async (data?: CreateOrderRequest): Promise<Order> => {
    const response = await axiosClient.post<Order>('/orders', data || {});
    return response.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await axiosClient.get<Order[]>('/orders');
    return response.data;
  },

  getOrderById: async (id: number): Promise<Order> => {
    const response = await axiosClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id: number): Promise<Order> => {
    const response = await axiosClient.put<Order>(`/orders/${id}/cancel`);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    const data: UpdateOrderStatusRequest = { status: status as any };
    const response = await axiosClient.put<Order>(`/orders/${id}/status`, data);
    return response.data;
  },
};

export default orderApi;
