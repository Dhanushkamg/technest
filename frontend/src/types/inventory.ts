export type MovementType = 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'RESTOCK' | 'DAMAGE';

export interface InventoryMovement {
  id: number;
  productId: number;
  productName: string;
  oldStock: number;
  quantityChange: number;
  newStock: number;
  movementType: MovementType;
  reason?: string | null;
  responsibleUserEmail?: string | null;
  createdAt: string;
}

export interface StockAdjustmentRequest {
  productId: number;
  quantityChange: number;
  movementType?: MovementType;
  reason?: string;
}

export interface AdjustStockRequest {
  quantity: number;
  adjustment?: number;
  movementType?: MovementType;
  reason?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
