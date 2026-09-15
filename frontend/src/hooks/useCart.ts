import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { cartApi } from '../api/cartApi';
import { productApi } from '../api/productApi';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import type { Cart, CartItem } from '../types';

export const useCart = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateCount = useCartStore((state) => state.updateCount);
  const guestCartItems = useCartStore((state) => state.guestCartItems);
  const setGuestCartItems = useCartStore((state) => state.setGuestCartItems);

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
    if (isAuthenticated) {
      if (cartQuery.data?.items) {
        const totalCount = cartQuery.data.items.reduce((acc, item) => acc + item.quantity, 0);
        updateCount(totalCount);
      }
    } else {
      const totalCount = guestCartItems.reduce((acc, item) => acc + item.quantity, 0);
      updateCount(totalCount);
    }
  }, [cartQuery.data, isAuthenticated, updateCount, guestCartItems]);

  // Add to Cart
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity, variantId }: { productId: number; quantity: number; variantId?: number }) => {
      if (isAuthenticated) {
        return cartApi.addToCart(productId, quantity, variantId);
      } else {
        const product = await productApi.getProductById(productId);
        const variant = variantId ? product.variants?.find(v => v.id === variantId) : null;
        
        let newGuestItems = [...guestCartItems];
        const existingItem = newGuestItems.find(i => i.productId === productId && i.variantId === (variantId || undefined));
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          const newItem: CartItem = {
            id: Date.now(), // Fake ID for local use
            productId: product.id,
            productName: product.name,
            imageUrl: product.images?.[0]?.url || product.imageUrl || '',
            price: variant?.priceOverride ?? product.price,
            quantity: quantity,
            subtotal: (variant?.priceOverride ?? product.price) * quantity,
            variantId: variant?.id,
            variantName: variant ? `Size: ${variant.size} | Color: ${variant.color}` : undefined
          };
          newGuestItems.push(newItem);
        }
        
        setGuestCartItems(newGuestItems);
        return { items: newGuestItems } as Cart;
      }
    },
    onSuccess: (data: Cart) => {
      if (isAuthenticated) {
        queryClient.setQueryData(['cart'], data);
        const totalCount = data.items.reduce((acc, item) => acc + item.quantity, 0);
        updateCount(totalCount);
      }
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg) toast.error(msg);
      else toast.error('Failed to add to cart');
    },
  });

  // Update quantity of a single cart item
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      if (isAuthenticated) {
        return cartApi.updateCartItem(itemId, quantity);
      } else {
        const newGuestItems = guestCartItems.map(item => {
          if (item.id === itemId) {
            return { ...item, quantity, subtotal: item.price * quantity };
          }
          return item;
        });
        setGuestCartItems(newGuestItems);
        return { items: newGuestItems } as Cart;
      }
    },
    onSuccess: (data: Cart) => {
      if (isAuthenticated) {
        queryClient.setQueryData(['cart'], data);
        const totalCount = data.items.reduce((acc, item) => acc + item.quantity, 0);
        updateCount(totalCount);
      }
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg) toast.error(msg);
    },
  });

  // Remove a single item from cart
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: number) => {
      if (isAuthenticated) {
        return cartApi.removeFromCart(itemId);
      } else {
        const newGuestItems = guestCartItems.filter(item => item.id !== itemId);
        setGuestCartItems(newGuestItems);
        return { items: newGuestItems } as Cart;
      }
    },
    onSuccess: (data: Cart) => {
      if (isAuthenticated) {
        queryClient.setQueryData(['cart'], data);
        const totalCount = data.items ? data.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
        updateCount(totalCount);
      }
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
      if (isAuthenticated) {
        const currentCart = queryClient.getQueryData<Cart>(['cart']);
        if (!currentCart?.items?.length) return;
        for (const item of currentCart.items) {
          await cartApi.removeFromCart(item.id);
        }
      } else {
        setGuestCartItems([]);
      }
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
      updateCount(0);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg) toast.error(msg);
    },
  });

  const currentCart = isAuthenticated 
    ? cartQuery.data 
    : { items: guestCartItems, id: 0, subtotal: 0, totalAmount: 0 } as Cart;

  return {
    ...cartQuery,
    cart: currentCart,
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
