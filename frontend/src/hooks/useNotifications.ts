import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationApi } from '../api/notificationApi';
import { useAuthStore } from '../store/useAuthStore';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Fetch full notifications list
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getNotifications,
    enabled: isAuthenticated,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: isAuthenticated ? 1000 * 30 : false,
  });

  // Fetch unread notification count
  const unreadCountQuery = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: notificationApi.getUnreadCount,
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
    refetchInterval: isAuthenticated ? 1000 * 30 : false,
  });

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to mark notification as read.');
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to mark all as read.');
    },
  });

  const notifications = notificationsQuery.data || [];
  const unreadCount = unreadCountQuery.data?.count ?? notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    refetch: notificationsQuery.refetch,

    markAsRead: markAsReadMutation.mutateAsync,
    isMarkingRead: markAsReadMutation.isPending,

    markAllAsRead: markAllAsReadMutation.mutateAsync,
    isMarkingAllRead: markAllAsReadMutation.isPending,
  };
};

export default useNotifications;
