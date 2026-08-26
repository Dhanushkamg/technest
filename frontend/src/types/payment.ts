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

export interface PayHereCheckoutParams {
  sandboxUrl: string;
  merchantId: string;
  orderId: string;
  items: string;
  currency: string;
  amount: number;
  hash: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

declare global {
  interface Window {
    payhere?: {
      onCompleted: (orderId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
      startPayment: (paymentObject: any) => void;
    };
  }
}
