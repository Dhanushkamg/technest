import axiosClient from './axiosClient';
import type { Category, CategoryRequest, DashboardResponse, Order, PagedProductResponse, Product, ProductRequest, UpdateOrderStatusRequest } from '../types';

export const adminApi = {
  getDashboardStats: async (): Promise<DashboardResponse> => {
    const response = await axiosClient.get<DashboardResponse>('/admin/dashboard');
    return response.data;
  },

  getAdminProducts: async (page = 0, size = 10): Promise<PagedProductResponse> => {
    const response = await axiosClient.get<PagedProductResponse>('/admin/products', {
      params: { page, size },
    });
    return response.data;
  },

  createProduct: async (data: ProductRequest): Promise<Product> => {
    const response = await axiosClient.post<Product>(`/admin/products?categoryId=${data.categoryId}`, data);
    return response.data;
  },

  updateProduct: async (id: number, data: ProductRequest): Promise<Product> => {
    const response = await axiosClient.put<Product>(`/admin/products/${id}?categoryId=${data.categoryId}`, data);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/products/${id}`);
  },

  getAdminOrders: async (): Promise<Order[]> => {
    const response = await axiosClient.get<Order[]>('/admin/orders');
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    const data: UpdateOrderStatusRequest = { status: status as any };
    const response = await axiosClient.put<Order>(`/admin/orders/${id}/status`, data);
    return response.data;
  },

  createCategory: async (data: CategoryRequest): Promise<Category> => {
    const response = await axiosClient.post<Category>('/admin/categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: CategoryRequest): Promise<Category> => {
    const response = await axiosClient.put<Category>(`/admin/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/categories/${id}`);
  },
};

export default adminApi;
