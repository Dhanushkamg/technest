import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';
import { useAuthStore } from '../store/useAuthStore';

export const useOrderDetails = (orderId?: number, token?: string | null) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['order', orderId, token],
    queryFn: () => orderApi.getOrderById(orderId!, token),
    enabled: (isAuthenticated || !!token) && !!orderId && !isNaN(orderId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
};

export default useOrderDetails;
