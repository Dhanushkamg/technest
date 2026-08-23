import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import type { ProductQueryParams } from '../types';

export const useProducts = (params?: ProductQueryParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export default useProducts;
