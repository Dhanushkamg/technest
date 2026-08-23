import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reviewApi } from '../api/reviewApi';
import type { ReviewRequest } from '../types';

export const useReviews = (productId: number) => {
  const queryClient = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewApi.getProductReviews(productId),
    enabled: !!productId && !isNaN(productId),
    staleTime: 1000 * 60 * 2,
  });

  const createReviewMutation = useMutation({
    mutationFn: (data: ReviewRequest) => reviewApi.createReview(productId, data),
    onSuccess: () => {
      toast.success('Thank you for your review!');
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to submit review.';
      toast.error(msg);
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: number; data: ReviewRequest }) =>
      reviewApi.updateReview(productId, reviewId, data),
    onSuccess: () => {
      toast.success('Your review has been updated!');
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to update review.';
      toast.error(msg);
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => reviewApi.deleteReview(productId, reviewId),
    onSuccess: () => {
      toast.success('Review deleted.');
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to delete review.';
      toast.error(msg);
    },
  });

  return {
    ...reviewsQuery,
    reviews: reviewsQuery.data || [],
    createReview: createReviewMutation.mutateAsync,
    isCreatingReview: createReviewMutation.isPending,
    updateReview: updateReviewMutation.mutateAsync,
    isUpdatingReview: updateReviewMutation.isPending,
    deleteReview: deleteReviewMutation.mutateAsync,
    isDeletingReview: deleteReviewMutation.isPending,
  };
};

export default useReviews;
