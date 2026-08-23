import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { cartApi } from '../api/cartApi';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

export const useCart = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateCount = useCartStore((state) => state.updateCount);

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  useEffect(() => {
    if (cartQuery.data?.items) {
      const totalCount = cartQuery.data.items.reduce((acc, item) => acc + item.quantity, 0);
      updateCount(totalCount);
    } else if (!isAuthenticated) {
      updateCount(0);
    }
  }, [cartQuery.data, isAuthenticated, updateCount]);

  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      cartApi.addToCart(productId, quantity),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      const totalCount = data.items.reduce((acc, item) => acc + item.quantity, 0);
      updateCount(totalCount);
    },
  });

  const updateCartItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartApi.updateCartItem(itemId, quantity),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      const totalCount = data.items.reduce((acc, item) => acc + item.quantity, 0);
      updateCount(totalCount);
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (itemId: number) => cartApi.removeFromCart(itemId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      const totalCount = data.items ? data.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
      updateCount(totalCount);
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      updateCount(0);
    },
  });

  return {
    ...cartQuery,
    addToCart: addToCartMutation.mutateAsync,
    isAddingToCart: addToCartMutation.isPending,
    updateCartItem: updateCartItemMutation.mutateAsync,
    isUpdatingCartItem: updateCartItemMutation.isPending,
    removeFromCart: removeFromCartMutation.mutateAsync,
    isRemovingFromCart: removeFromCartMutation.isPending,
    clearCart: clearCartMutation.mutateAsync,
    isClearingCart: clearCartMutation.isPending,
  };
};

export default useCart;
