import axiosClient from '../axiosClient';
import type { Category, CategoryRequest } from '../../types';

export const categoryAdminApi = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await axiosClient.get<Category[]>('/admin/categories');
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

export default categoryAdminApi;
