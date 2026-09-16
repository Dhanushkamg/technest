// Matches CartItemDto from backend exactly
export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  stockQuantity?: number;
  variantId?: number;
  variantName?: string;
}

// Matches CartDto from backend exactly
export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
}

// Request DTOs - match AddToCartRequest exactly
export interface AddToCartRequest {
  productId: number;
  quantity: number;
  variantId?: number;
}

// Request DTOs - match UpdateCartItemRequest exactly
export interface UpdateCartItemRequest {
  quantity: number;
}
