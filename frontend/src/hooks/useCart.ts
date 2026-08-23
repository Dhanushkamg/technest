import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { cartApi } from '../api/cartApi';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import type { Cart } from '../types';

export const useCart = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateCount = useCartStore((state) => state.updateCount);

  // Only fetch cart when authenticated — backend requires JWT
  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 min stale time
    retry: 1,
  });

  // Sync Zustand cart badge count whenever cart data changes
  useEffect(() => {
    if (cartQuery.data?.items) {
      const totalCount = cartQuery.data.items.reduce((acc, item) => acc + item.quantity, 0);
      updateCount(totalCount);
    } else if (!isAuthenticated) {
      updateCount(0);
    }
  }, [cartQuery.data, isAuthenticated, updateCount]);

  // Add to Cart
  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      cartApi.addToCart(productId, quantity),
    onSuccess: (data: Cart) => {
      queryClient.setQueryData(['cart'], data);
      const totalCount = data.items.reduce((acc, item) => acc + item.quantity, 0);
      updateCount(totalCount);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg) toast.error(msg);
    },
  });

  // Update quantity of a single cart item
  const updateCartItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartApi.updateCartItem(itemId, quantity),
    onSuccess: (data: Cart) => {
      queryClient.setQueryData(['cart'], data);
      const totalCount = data.items.reduce((acc, item) => acc + item.quantity, 0);
      updateCount(totalCount);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg) toast.error(msg);
    },
  });

  // Remove a single item from cart
  const removeFromCartMutation = useMutation({
    mutationFn: (itemId: number) => cartApi.removeFromCart(itemId),
    onSuccess: (data: Cart) => {
      queryClient.setQueryData(['cart'], data);
      const totalCount = data.items ? data.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
      updateCount(totalCount);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg) toast.error(msg);
    },
  });

  /**
   * Clear cart — removes all items one by one.
   * The backend has no DELETE /api/cart endpoint, only DELETE /api/cart/items/{id}.
   */
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const currentCart = queryClient.getQueryData<Cart>(['cart']);
      if (!currentCart?.items?.length) return;
      for (const item of currentCart.items) {
        await cartApi.removeFromCart(item.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      updateCount(0);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg) toast.error(msg);
    },
  });

  return {
    ...cartQuery,
    cart: cartQuery.data,
    addToCart: addToCartMutation.mutateAsync,
    isAddingToCart: addToCartMutation.isPending,
    addingProductId: addToCartMutation.isPending
      ? (addToCartMutation.variables as { productId: number })?.productId
      : null,
    updateCartItem: updateCartItemMutation.mutateAsync,
    isUpdatingCartItem: updateCartItemMutation.isPending,
    updatingItemId: updateCartItemMutation.isPending
      ? (updateCartItemMutation.variables as { itemId: number })?.itemId
      : null,
    removeFromCart: removeFromCartMutation.mutateAsync,
    isRemovingFromCart: removeFromCartMutation.isPending,
    removingItemId: removeFromCartMutation.isPending
      ? (removeFromCartMutation.variables as number)
      : null,
    clearCart: clearCartMutation.mutateAsync,
    isClearingCart: clearCartMutation.isPending,
  };
};

export default useCart;
