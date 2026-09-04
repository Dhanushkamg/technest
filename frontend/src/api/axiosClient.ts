import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError<{ message?: string; error?: { message?: string } }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        return axiosClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('technest_auth');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
  
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          toast.error('Session expired. Please log in again.');
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(refreshError);
      }
    } else if (error.response?.status === 401) {
      localStorage.removeItem('technest_auth');
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login?expired=true';
      }
    } else if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission to perform this action.');
    } else if (error.response?.data?.error?.message) {
      toast.error(error.response.data.error.message);
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message === 'Network Error') {
      toast.error('Unable to connect to the TechNest server. Please check your backend connection.');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;