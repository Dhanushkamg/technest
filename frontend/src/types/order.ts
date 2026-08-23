export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface DeliveryAddressSnapshot {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: number;
  userId: number;
  subtotal: number;
  discountAmount: number;
  couponCode?: string | null;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  deliveryAddress?: DeliveryAddressSnapshot | null;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  addressId?: number;
  couponCode?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
