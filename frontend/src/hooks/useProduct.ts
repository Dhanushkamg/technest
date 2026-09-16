import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/productApi';

export const useProduct = (identifier: string | number) => {
  return useQuery({
    queryKey: ['product', identifier],
    queryFn: () => productApi.getProductById(identifier),
    enabled: !!identifier,
    staleTime: 1000 * 60 * 5,
  });
};

export const useRelatedProducts = (identifier: string | number) => {
  return useQuery({
    queryKey: ['product', identifier, 'related'],
    queryFn: () => productApi.getRelatedProducts(identifier),
    enabled: !!identifier,
    staleTime: 1000 * 60 * 5,
  });
};

export default useProduct;
