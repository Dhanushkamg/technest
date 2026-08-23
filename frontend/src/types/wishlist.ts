export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
}

export interface WishlistResponse {
  items: WishlistItem[];
}
