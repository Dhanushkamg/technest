import axiosClient from '../axiosClient';
import type { Product, ProductRequest } from '../../types';

export interface UpdateStockRequest {
  stock: number;
}

export interface AdjustStockRequest {
  quantity: number;
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

  adjustStock: async (id: number, quantity: number): Promise<Product> => {
    const response = await axiosClient.patch<Product>(`/admin/products/${id}/stock/adjust`, { quantity });
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/products/${id}`);
  },

  uploadProductImage: async (id: number, file: File, isPrimary: boolean, sortOrder: number): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrimary', isPrimary.toString());
    formData.append('sortOrder', sortOrder.toString());

    const response = await axiosClient.post<string>(`/admin/products/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default productAdminApi;
