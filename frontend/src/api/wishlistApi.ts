import axiosClient from './axiosClient';
import type { WishlistResponse } from '../types';

export const wishlistApi = {
  getWishlist: async (): Promise<WishlistResponse> => {
    const response = await axiosClient.get<WishlistResponse>('/wishlist');
    return response.data;
  },

  addToWishlist: async (productId: number): Promise<WishlistResponse> => {
    const response = await axiosClient.post<WishlistResponse>(`/wishlist/items/${productId}`);
    return response.data;
  },

  removeFromWishlist: async (itemId: number): Promise<WishlistResponse> => {
    const response = await axiosClient.delete<WishlistResponse>(`/wishlist/items/${itemId}`);
    return response.data;
  },
};

export default wishlistApi;
