import axiosClient from '../axiosClient';
import type { Product, ProductRequest } from '../../types';

export interface UpdateStockRequest {
  stock: number;
}

export interface AdjustStockRequest {
  adjustment: number;
}

export const productAdminApi = {
  getAllProducts: async (): Promise<Product[]> => {
    const response = await axiosClient.get<Product[]>('/admin/products');
    return response.data;
  },

  createProduct: async (data: ProductRequest): Promise<Product> => {
    const response = await axiosClient.post<Product>('/admin/products', data);
    return response.data;
  },

  updateProduct: async (id: number, data: ProductRequest): Promise<Product> => {
    const response = await axiosClient.put<Product>(`/admin/products/${id}`, data);
    return response.data;
  },

  updateStock: async (id: number, stock: number): Promise<Product> => {
    const response = await axiosClient.patch<Product>(`/admin/products/${id}/stock`, { stock });
    return response.data;
  },

  adjustStock: async (id: number, adjustment: number): Promise<Product> => {
    const response = await axiosClient.patch<Product>(`/admin/products/${id}/stock/adjust`, { adjustment });
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/products/${id}`);
  },
};

export default productAdminApi;
