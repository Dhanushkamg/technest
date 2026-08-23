import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import { useAuthStore } from '../store/useAuthStore';

export const useDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminApi.getDashboardStats,
    enabled: isAdmin,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export default useDashboard;
