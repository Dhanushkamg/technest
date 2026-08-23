export type NotificationType = 'ORDER_STATUS' | 'PROMOTION' | 'SYSTEM' | string;

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
