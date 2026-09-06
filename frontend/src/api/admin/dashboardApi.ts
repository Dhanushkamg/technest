import axiosClient from '../axiosClient';
import type { DashboardResponse } from '../../types';

export const dashboardApi = {
  getDashboardStats: async (
    range?: string,
    startDate?: string,
    endDate?: string
  ): Promise<DashboardResponse> => {
    const params = new URLSearchParams();
    if (range) params.append('range', range);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const url = `/admin/dashboard${queryString ? `?${queryString}` : ''}`;
    const response = await axiosClient.get<DashboardResponse>(url);
    return response.data;
  },
};

export default dashboardApi;
