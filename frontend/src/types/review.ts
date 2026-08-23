export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ReviewRequest {
  rating: number;
  comment: string;
}
