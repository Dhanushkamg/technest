import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';
import { useAuthStore } from '../store/useAuthStore';

export const useOrderDetails = (orderId?: number) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getOrderById(orderId!),
    enabled: isAuthenticated && !!orderId && !isNaN(orderId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
};

export default useOrderDetails;
