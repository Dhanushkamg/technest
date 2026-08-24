import axiosClient from './axiosClient';
import type { Notification, UnreadCountResponse } from '../types';

export const notificationApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await axiosClient.get<Notification[]>('/notifications');
    return response.data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await axiosClient.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    await axiosClient.put(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosClient.put('/notifications/read-all');
  },
};

export default notificationApi;
