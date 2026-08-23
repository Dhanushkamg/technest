import axiosClient from './axiosClient';
import type { Notification, UnreadCountResponse } from '../types';

export const notificationApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await axiosClient.get<Notification[]>('/notifications');
    return response.data;
  },

  markAsRead: async (notificationId: number): Promise<Notification> => {
    const response = await axiosClient.put<Notification>(`/notifications/${notificationId}/read`);
    return response.data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await axiosClient.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data;
  },
};

export default notificationApi;
