export type NotificationType =
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_UPDATED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'ORDER_CANCELLED'
  | 'REFUND_PROCESSED'
  | string;

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}
