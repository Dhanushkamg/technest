import axiosClient from './axiosClient';
import type { AddToCartRequest, Cart, UpdateCartItemRequest } from '../types';

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await axiosClient.get<Cart>('/cart');
    return response.data;
  },

  addToCart: async (productId: number, quantity: number): Promise<Cart> => {
    const data: AddToCartRequest = { productId, quantity };
    const response = await axiosClient.post<Cart>('/cart/items', data);
    return response.data;
  },

  updateCartItem: async (itemId: number, quantity: number): Promise<Cart> => {
    const data: UpdateCartItemRequest = { quantity };
    const response = await axiosClient.put<Cart>(`/cart/items/${itemId}`, data);
    return response.data;
  },

  removeFromCart: async (itemId: number): Promise<Cart> => {
    const response = await axiosClient.delete<Cart>(`/cart/items/${itemId}`);
    return response.data;
  },

  clearCart: async (): Promise<Cart> => {
    const response = await axiosClient.delete<Cart>('/cart');
    return response.data;
  },
};

export default cartApi;
