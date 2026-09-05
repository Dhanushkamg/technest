import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Edit3, Trash2, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useReviews } from '../../hooks/useReviews';
import { useAuthStore } from '../../store/useAuthStore';
import RatingStars from '../common/RatingStars';
import { Button } from '../ui/Button';
import type { Review } from '../../types';

interface ProductReviewsProps {
  productId: number;
  averageRating: number;
  reviewCount: number;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  averageRating,
  reviewCount,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    reviews,
    isLoading,
    createReview,
    isCreatingReview,
    updateReview,
    isUpdatingReview,
    deleteReview,
    isDeletingReview,
  } = useReviews(productId);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to write a review');
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a comment for your review.');
      return;
    }

    try {
      if (editingReviewId) {
        await updateReview({ reviewId: editingReviewId, data: { rating, comment } });
        setEditingReviewId(null);
      } else {
        await createReview({ rating, comment });
      }
      setComment('');
      setRating(5);
    } catch {
      // Handled in hook
    }
  };

  const handleEditClick = (review: Review) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setComment('');
    setRating(5);
  };

  const handleDeleteConfirm = async (reviewId: number) => {
    try {
      await deleteReview(reviewId);
      setDeletingReviewId(null);
    } catch {
      // Handled in hook
    }
  };

  // Compute rating breakdown (counts per star)
  const totalRev = reviews.length || reviewCount || 0;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingCounts[r.rating as keyof typeof ratingCounts] += 1;
    }
  });

  return (
    <div className="space-y-8">
      {/* Rating Breakdown Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
        {/* Left: Overall Score */}
        <div className="flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 text-center">
          <span className="text-5xl font-black text-slate-900 dark:text-white mb-2">
            {averageRating ? Number(averageRating).toFixed(1) : '0.0'}
          </span>
          <RatingStars rating={averageRating} reviewCount={totalRev} size="md" />
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Based on {totalRev} verified reviews
          </span>
        </div>

        {/* Middle: Rating Bar Breakdown */}
        <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[stars as keyof typeof ratingCounts] || 0;
            const pct = totalRev > 0 ? (count / totalRev) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-8 text-slate-600 dark:text-slate-400 font-semibold text-right">{stars} ★</span>
                <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-slate-400 dark:text-slate-500 text-right font-mono">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write / Edit Review Form */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-brand-500 dark:text-brand-400" />
            {editingReviewId ? 'Edit Your Review' : 'Write a Customer Review'}
          </h3>
          {editingReviewId && (
            <button
              onClick={handleCancelEdit}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {!isAuthenticated ? (
          <div className="p-6 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/40">
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mb-4">
              Have you purchased this product? Sign in to share your experience.
            </p>
            <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
              Sign In to Review
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Interactive Rating Stars */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Select Your Rating *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 font-bold">{rating} / 5 Stars</span>
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Your Review Comments *
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share technical feedback, build quality, and usability..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:border-brand-500 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isCreatingReview || isUpdatingReview}
                disabled={!comment.trim()}
              >
                {editingReviewId ? 'Update Review' : 'Submit Review'}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-500 dark:text-brand-400" />
          Verified Reviews ({reviews.length})
        </h3>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-100 dark:bg-slate-900 rounded-2xl" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
            No customer reviews yet. Be the first to review this product!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => {
              const isOwner = user?.id === r.userId;
              const isDeleting = deletingReviewId === r.id;

              return (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-xs block">
                          {r.userName || `User #${r.userId}`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <RatingStars rating={r.rating} reviewCount={1} showCount={false} />

                      {isOwner && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditClick(r)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                            title="Edit Review"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingReviewId(r.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            title="Delete Review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{r.comment}</p>

                  {/* Inline Delete Confirmation */}
                  <AnimatePresence>
                    {isDeleting && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">Delete this review permanently?</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDeletingReviewId(null)}
                            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(r.id)}
                            disabled={isDeletingReview}
                            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1"
                          >
                            {isDeletingReview && <Loader2 className="w-3 h-3 animate-spin" />} Delete
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
