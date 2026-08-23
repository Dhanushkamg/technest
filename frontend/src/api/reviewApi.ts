import axiosClient from './axiosClient';
import type { Review, ReviewRequest } from '../types';

export const reviewApi = {
  getProductReviews: async (productId: number): Promise<Review[]> => {
    const response = await axiosClient.get<Review[]>(`/products/${productId}/reviews`);
    return response.data;
  },

  createReview: async (productId: number, data: ReviewRequest): Promise<Review> => {
    const response = await axiosClient.post<Review>(`/products/${productId}/reviews`, data);
    return response.data;
  },

  updateReview: async (productId: number, reviewId: number, data: ReviewRequest): Promise<Review> => {
    const response = await axiosClient.put<Review>(`/products/${productId}/reviews/${reviewId}`, data);
    return response.data;
  },

  deleteReview: async (productId: number, reviewId: number): Promise<void> => {
    await axiosClient.delete(`/products/${productId}/reviews/${reviewId}`);
  },
};

export default reviewApi;
