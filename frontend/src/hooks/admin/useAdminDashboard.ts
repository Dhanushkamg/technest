import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/admin/dashboardApi';
import { useAuthStore } from '../../store/useAuthStore';

export const useAdminDashboard = (range?: string, startDate?: string, endDate?: string) => {
  const { isAuthenticated, user } = useAuthStore();
  const roleUpper = (user?.role || '').toUpperCase();
  const isAdmin = roleUpper === 'ROLE_ADMIN' || roleUpper === 'ADMIN';

  return useQuery({
    queryKey: ['adminDashboard', range, startDate, endDate],
    queryFn: () => dashboardApi.getDashboardStats(range, startDate, endDate),
    enabled: isAuthenticated && isAdmin,
    staleTime: 1000 * 60 * 2, // 2 min
    retry: 1,
  });
};

export default useAdminDashboard;
