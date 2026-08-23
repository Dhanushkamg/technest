import axiosClient from './axiosClient';
import type { Cart } from '../types';

/**
 * Cart API — wraps Spring Boot CartController at /api/cart
 *
 * Verified endpoints from CartController.java:
 *   GET    /api/cart              → CartDto
 *   POST   /api/cart/items        → CartDto  (body: { productId, quantity })
 *   PUT    /api/cart/items/{id}   → CartDto  (body: { quantity })
 *   DELETE /api/cart/items/{id}   → CartDto
 *
 * NOTE: There is NO DELETE /api/cart (clear cart) endpoint in the backend.
 * Clear cart is implemented by removing all items one by one on the frontend.
 */
export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await axiosClient.get<Cart>('/cart');
    return response.data;
  },

  addToCart: async (productId: number, quantity: number): Promise<Cart> => {
    const response = await axiosClient.post<Cart>('/cart/items', { productId, quantity });
    return response.data;
  },

  updateCartItem: async (itemId: number, quantity: number): Promise<Cart> => {
    const response = await axiosClient.put<Cart>(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId: number): Promise<Cart> => {
    const response = await axiosClient.delete<Cart>(`/cart/items/${itemId}`);
    return response.data;
  },
};

export default cartApi;
