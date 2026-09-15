import axiosClient from './axiosClient';
import type { CreateOrderRequest, Order, OrderStatus, UpdateOrderStatusRequest } from '../types';

export const orderApi = {
  createOrder: async (data?: CreateOrderRequest): Promise<Order> => {
    const response = await axiosClient.post<Order>('/orders', data || {});
    return response.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await axiosClient.get<Order[]>('/orders');
    return response.data;
  },

  getOrderById: async (id: number, token?: string | null): Promise<Order> => {
    const url = token ? `/orders/${id}?token=${token}` : `/orders/${id}`;
    const response = await axiosClient.get<Order>(url);
    return response.data;
  },

  cancelOrder: async (id: number): Promise<Order> => {
    const response = await axiosClient.put<Order>(`/orders/${id}/cancel`);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: OrderStatus | string): Promise<Order> => {
    const data: UpdateOrderStatusRequest = { status: status as OrderStatus };
    const response = await axiosClient.put<Order>(`/orders/${id}/status`, data);
    return response.data;
  },
};

export default orderApi;
