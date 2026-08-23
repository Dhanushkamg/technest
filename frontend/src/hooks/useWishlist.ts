import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { wishlistApi } from '../api/wishlistApi';
import { useAuthStore } from '../store/useAuthStore';
import type { WishlistResponse } from '../types';

export const useWishlist = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Fetch wishlist query
  const wishlistQuery = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.getWishlist,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const wishlistItems = wishlistQuery.data?.items || [];
  const wishlistedProductIds = new Set(wishlistItems.map((item) => item.productId));

  const isInWishlist = (productId: number): boolean => {
    return wishlistedProductIds.has(productId);
  };

  // Add to Wishlist Mutation
  const addToWishlistMutation = useMutation({
    mutationFn: (productId: number) => wishlistApi.addToWishlist(productId),
    onSuccess: (data: WishlistResponse) => {
      queryClient.setQueryData(['wishlist'], data);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to add item to wishlist.';
      toast.error(msg);
    },
  });

  // Remove from Wishlist Mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: (productId: number) => wishlistApi.removeFromWishlist(productId),
    onSuccess: (data: WishlistResponse) => {
      queryClient.setQueryData(['wishlist'], data);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to remove item from wishlist.';
      toast.error(msg);
    },
  });

  const toggleWishlist = async (productId: number, productName?: string) => {
    if (!isAuthenticated) return false;

    if (isInWishlist(productId)) {
      await removeFromWishlistMutation.mutateAsync(productId);
      toast.info(productName ? `Removed "${productName}" from wishlist.` : 'Removed from wishlist.');
      return false;
    } else {
      await addToWishlistMutation.mutateAsync(productId);
      toast.success(productName ? `Added "${productName}" to wishlist!` : 'Added to wishlist!');
      return true;
    }
  };

  return {
    ...wishlistQuery,
    wishlistItems,
    wishlistedProductIds,
    isInWishlist,
    toggleWishlist,
    addToWishlist: addToWishlistMutation.mutateAsync,
    isAddingToWishlist: addToWishlistMutation.isPending,
    removeFromWishlist: removeFromWishlistMutation.mutateAsync,
    isRemovingFromWishlist: removeFromWishlistMutation.isPending,
  };
};

export default useWishlist;
