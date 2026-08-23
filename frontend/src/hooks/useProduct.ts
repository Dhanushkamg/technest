import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/productApi';

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductById(id),
    enabled: !!id && !isNaN(id),
    staleTime: 1000 * 60 * 5,
  });
};

export default useProduct;
