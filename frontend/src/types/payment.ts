export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

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
  paymentMethod: string;
}

export interface PaymentConfirmRequest {
  paymentId: number;
  paymentIntentId?: string;
  status: PaymentStatus;
}
