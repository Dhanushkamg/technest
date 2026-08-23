import axiosClient from './axiosClient';
import type { PagedProductResponse, Product, ProductQueryParams } from '../types';

export const productApi = {
  getProducts: async (params?: ProductQueryParams): Promise<PagedProductResponse> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.size !== undefined) cleanParams.size = params.size;
      if (params.sortBy) cleanParams.sortBy = params.sortBy;
      if (params.sortDir) cleanParams.sortDir = params.sortDir;
      if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
      if (params.categoryId) cleanParams.categoryId = params.categoryId;
      if (params.minPrice !== undefined && params.minPrice > 0) cleanParams.minPrice = params.minPrice;
      if (params.maxPrice !== undefined && params.maxPrice > 0) cleanParams.maxPrice = params.maxPrice;
      if (params.minRating !== undefined && params.minRating > 0) cleanParams.minRating = params.minRating;
    }

    const response = await axiosClient.get<PagedProductResponse>('/products', { params: cleanParams });
    return response.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await axiosClient.get<Product>(`/products/${id}`);
    return response.data;
  },
};

export default productApi;
