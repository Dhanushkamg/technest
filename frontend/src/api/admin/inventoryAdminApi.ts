import axiosClient from '../axiosClient';
import type { InventoryMovement, StockAdjustmentRequest, PageResponse } from '../../types';

export const inventoryAdminApi = {
  getMovements: async (page = 0, size = 20): Promise<PageResponse<InventoryMovement>> => {
    const response = await axiosClient.get<PageResponse<InventoryMovement>>('/admin/inventory/movements', {
      params: { page, size },
    });
    return response.data;
  },

  getProductMovements: async (productId: number): Promise<InventoryMovement[]> => {
    const response = await axiosClient.get<InventoryMovement[]>(`/admin/inventory/movements/product/${productId}`);
    return response.data;
  },

  adjustStock: async (data: StockAdjustmentRequest): Promise<InventoryMovement> => {
    const response = await axiosClient.post<InventoryMovement>('/admin/inventory/adjust', data);
    return response.data;
  },
};

export default inventoryAdminApi;
