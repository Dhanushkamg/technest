export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface CreatePaymentRequest {
  orderId: number;
  amount: number;
  paymentMethod: string;
}

export interface PaymentConfirmRequest {
  status: PaymentStatus;
}
