import axiosClient from '../axiosClient';
import type { DashboardResponse } from '../../types';

export const dashboardApi = {
  getDashboardStats: async (): Promise<DashboardResponse> => {
    const response = await axiosClient.get<DashboardResponse>('/admin/dashboard');
    return response.data;
  },
};

export default dashboardApi;
