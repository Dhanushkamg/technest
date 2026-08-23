import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Edit3, Trash2, Loader2, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useReviews } from '../../hooks/useReviews';
import { useAuthStore } from '../../store/useAuthStore';
import RatingStars from '../common/RatingStars';
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
    <div className="mt-16 pt-12 border-t border-slate-800/80 space-y-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-cyan-400" /> Customer Reviews & Ratings
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real feedback from verified purchasers</p>
        </div>
      </div>

      {/* Rating Breakdown Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl">
        {/* Left: Overall Score */}
        <div className="flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-800/80 text-center">
          <span className="text-5xl font-black text-white mb-2">
            {averageRating ? Number(averageRating).toFixed(1) : '0.0'}
          </span>
          <RatingStars rating={averageRating} reviewCount={totalRev} size="md" />
          <span className="text-xs text-slate-400 mt-2 font-medium">Based on {totalRev} verified reviews</span>
        </div>

        {/* Middle: Rating Bar Breakdown */}
        <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[stars as keyof typeof ratingCounts] || 0;
            const pct = totalRev > 0 ? (count / totalRev) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-8 text-slate-400 font-semibold text-right">{stars} ★</span>
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-slate-500 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write / Edit Review Form */}
      <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-cyan-400" />
            {editingReviewId ? 'Edit Your Review' : 'Write a Customer Review'}
          </h3>
          {editingReviewId && (
            <button
              onClick={handleCancelEdit}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {!isAuthenticated ? (
          <div className="p-6 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
            <p className="text-slate-400 text-sm mb-4">Have you purchased this product? Sign in to share your experience.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
            >
              Sign In to Review
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Interactive Rating Stars */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Select Your Rating *</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-slate-400 ml-2 font-bold">{rating} / 5 Stars</span>
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Your Review Comments *</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share performance, build quality, setup experience..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isCreatingReview || isUpdatingReview || !comment.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-all"
              >
                {isCreatingReview || isUpdatingReview ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {editingReviewId ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">All Reviews ({reviews.length})</h3>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-2xl p-4" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center border border-slate-800/80 rounded-2xl bg-slate-900/40">
            <p className="text-slate-400 text-sm">No reviews yet for this product. Be the first to leave a review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => {
              const isOwner = user?.id === rev.userId;
              return (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-2xl border transition-all ${
                    isOwner
                      ? 'bg-slate-900/80 border-cyan-500/50 shadow-lg shadow-cyan-500/5'
                      : 'bg-slate-900/50 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-cyan-400 font-bold text-xs">
                        {rev.userName?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 text-sm">{rev.userName}</span>
                          {isOwner && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                              Your Review
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <RatingStars rating={rev.rating} size="sm" />
                      {isOwner && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditClick(rev)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                            title="Edit Review"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingReviewId(rev.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Delete Review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed pl-12">{rev.comment}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingReviewId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingReviewId(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Review?</h3>
              <p className="text-xs text-slate-400">Are you sure you want to delete your review? This action cannot be undone.</p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeletingReviewId(null)}
                  disabled={isDeletingReview}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteConfirm(deletingReviewId)}
                  disabled={isDeletingReview}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  {isDeletingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductReviews;
