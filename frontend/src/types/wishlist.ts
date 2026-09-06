export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  stockQuantity: number;
}

export interface WishlistResponse {
  items: WishlistItem[];
}
