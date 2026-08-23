export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface DeliveryAddressSnapshot {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: number;
  userId: number;
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  deliveryAddress?: DeliveryAddressSnapshot;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  deliveryAddressId?: number;
  couponCode?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
