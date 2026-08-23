import axiosClient from './axiosClient';
import type { PagedProductResponse, Product, ProductQueryParams } from '../types';

export const productApi = {
  getProducts: async (params?: ProductQueryParams): Promise<PagedProductResponse> => {
    const response = await axiosClient.get<PagedProductResponse>('/products', { params });
    return response.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await axiosClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  searchProducts: async (query: string): Promise<PagedProductResponse> => {
    const response = await axiosClient.get<PagedProductResponse>('/products', {
      params: { search: query },
    });
    return response.data;
  },

  getProductsByCategory: async (categoryId: number, page = 0, size = 10): Promise<PagedProductResponse> => {
    const response = await axiosClient.get<PagedProductResponse>('/products', {
      params: { categoryId, page, size },
    });
    return response.data;
  },
};

export default productApi;
