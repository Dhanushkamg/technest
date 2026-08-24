import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orderAdminApi } from '../../api/admin/orderAdminApi';
import type { OrderStatus } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';

export const useAdminOrders = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const roleUpper = (user?.role || '').toUpperCase();
  const isAdmin = roleUpper === 'ROLE_ADMIN' || roleUpper === 'ADMIN';

  const ordersQuery = useQuery({
    queryKey: ['adminOrders'],
    queryFn: orderAdminApi.getAllOrders,
    enabled: isAuthenticated && isAdmin,
    staleTime: 1000 * 60 * 2,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      orderAdminApi.updateOrderStatus(id, status),
    onSuccess: (updatedOrder) => {
      toast.success(`Order #${updatedOrder.id} status updated to ${updatedOrder.status}`);
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update order status.');
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (id: number) => orderAdminApi.cancelOrder(id),
    onSuccess: (updatedOrder) => {
      toast.success(`Order #${updatedOrder.id} cancelled.`);
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    },
  });

  return {
    ...ordersQuery,
    orders: ordersQuery.data || [],
    updateOrderStatus: updateOrderStatusMutation.mutateAsync,
    isUpdatingStatus: updateOrderStatusMutation.isPending,
    cancelOrder: cancelOrderMutation.mutateAsync,
    isCancellingOrder: cancelOrderMutation.isPending,
  };
};

export default useAdminOrders;
