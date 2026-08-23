import axiosClient from './axiosClient';
import type { CreatePaymentRequest, Payment, PaymentConfirmRequest } from '../types';

export const paymentApi = {
  createPayment: async (data: CreatePaymentRequest): Promise<Payment> => {
    const response = await axiosClient.post<Payment>('/payments', data);
    return response.data;
  },

  confirmPayment: async (data: PaymentConfirmRequest): Promise<Payment> => {
    const response = await axiosClient.post<Payment>('/payments/confirm', data);
    return response.data;
  },

  getPaymentByOrderId: async (orderId: number): Promise<Payment> => {
    const response = await axiosClient.get<Payment>(`/payments/order/${orderId}`);
    return response.data;
  },
};

export default paymentApi;
