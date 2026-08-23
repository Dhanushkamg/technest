import axiosClient from './axiosClient';
import type { Category } from '../types';

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await axiosClient.get<Category[]>('/categories');
    return response.data;
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await axiosClient.get<Category>(`/categories/${id}`);
    return response.data;
  },
};

export default categoryApi;
