import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import inventoryAdminApi from '../../api/admin/inventoryAdminApi';
import type { StockAdjustmentRequest } from '../../types';

export const useAdminInventoryMovements = (page = 0, size = 20) => {
  return useQuery({
    queryKey: ['admin-inventory-movements', page, size],
    queryFn: () => inventoryAdminApi.getMovements(page, size),
  });
};

export const useAdminProductMovements = (productId: number | null) => {
  return useQuery({
    queryKey: ['admin-inventory-product-movements', productId],
    queryFn: () => (productId ? inventoryAdminApi.getProductMovements(productId) : Promise.resolve([])),
    enabled: productId !== null && productId > 0,
  });
};

export const useAdjustStockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockAdjustmentRequest) => inventoryAdminApi.adjustStock(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-product-movements', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
