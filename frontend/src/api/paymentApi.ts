import axiosClient from './axiosClient';
import type { CreatePaymentRequest, Payment, PaymentConfirmRequest } from '../types';

export const paymentApi = {
  // Direct simulated payment (creates & confirms in one call)
  createPayment: async (data: CreatePaymentRequest): Promise<Payment> => {
    const response = await axiosClient.post<Payment>('/payments', data);
    return response.data;
  },

  // 2-step flow: initiate payment
  initiatePayment: async (data: CreatePaymentRequest): Promise<Payment> => {
    const response = await axiosClient.post<Payment>('/payments/initiate', data);
    return response.data;
  },

  // 2-step flow: confirm payment by ID
  confirmPayment: async (paymentId: number, data: PaymentConfirmRequest): Promise<Payment> => {
    const response = await axiosClient.post<Payment>(`/payments/${paymentId}/confirm`, data);
    return response.data;
  },

  // Get payments by order ID (returns list)
  getPaymentsByOrderId: async (orderId: number): Promise<Payment[]> => {
    const response = await axiosClient.get<Payment[]>(`/payments/order/${orderId}`);
    return response.data;
  },

  // Get payment by payment ID
  getPaymentById: async (id: number): Promise<Payment> => {
    const response = await axiosClient.get<Payment>(`/payments/${id}`);
    return response.data;
  },
};

export default paymentApi;
