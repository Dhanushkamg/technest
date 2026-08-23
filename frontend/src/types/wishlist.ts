export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
}

export interface WishlistResponse {
  id: number;
  userId: number;
  items: WishlistItem[];
}
