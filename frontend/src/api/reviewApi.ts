import axiosClient from './axiosClient';
import type { Review, ReviewRequest } from '../types';

export const reviewApi = {
  getProductReviews: async (productId: number): Promise<Review[]> => {
    const response = await axiosClient.get<Review[]>(`/reviews/product/${productId}`);
    return response.data;
  },

  createReview: async (productId: number, data: ReviewRequest): Promise<Review> => {
    const response = await axiosClient.post<Review>(`/reviews/product/${productId}`, data);
    return response.data;
  },

  updateReview: async (reviewId: number, data: ReviewRequest): Promise<Review> => {
    const response = await axiosClient.put<Review>(`/reviews/${reviewId}`, data);
    return response.data;
  },

  deleteReview: async (reviewId: number): Promise<void> => {
    await axiosClient.delete(`/reviews/${reviewId}`);
  },
};

export default reviewApi;
