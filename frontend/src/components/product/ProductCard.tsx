import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { Product } from '../../types';
import { getProductImage } from '../../utils/productImages';
import { RatingStars } from '../common/RatingStars';
import { useCart } from '../../hooks/useCart';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useWishlist } from '../../hooks/useWishlist';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const { addToCart, isAddingToCart } = useCart();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openMiniCart = useCartStore((state) => state.openMiniCart);
  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlist();

  const [imgError, setImgError] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const isWishlistPending = isAddingToWishlist || isRemovingFromWishlist;

  const imageUrl = imgError
    ? 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
    : getProductImage(product);

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      navigate('/login');
      return;
    }

    try {
      await addToCart({ productId: product.id, quantity: 1 });
      toast.success(`Added ${product.name} to cart!`);
      openMiniCart();
    } catch {
      // Handled in axios interceptor
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please log in to manage your wishlist');
      navigate('/login');
      return;
    }

    try {
      await toggleWishlist(product.id, product.name);
    } catch {
      // Handled in hook
    }
  };

  // Stock status determination
  const getStockBadge = () => {
    if (product.stock === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
          <XCircle className="w-3 h-3" /> Out of Stock
        </span>
      );
    }
    if (product.stock <= 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
          <AlertCircle className="w-3 h-3" /> Only {product.stock} left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
        <CheckCircle className="w-3 h-3" /> In Stock
      </span>
    );
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        onClick={handleCardClick}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.15 }}
        className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-brand-500/60 dark:hover:border-brand-400/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-6 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
      >
        {/* Image Container */}
        <div className="relative w-full sm:w-48 h-48 sm:h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 flex-shrink-0">
          <img
            src={imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 sm:hidden z-10">
            <button
              type="button"
              onClick={handleToggleWishlist}
              disabled={isWishlistPending}
              className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {isWishlistPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
              ) : (
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'text-rose-500 fill-rose-500' : ''}`} />
              )}
            </button>
          </div>
        </div>

        {/* Content Info */}
        <div className="flex-1 w-full space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              {product.categoryName}
            </span>
            {getStockBadge()}
          </div>

          <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors text-base line-clamp-1">
            {product.name}
          </h3>

          <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2">
            {product.description || 'Engineered for high performance, reliability, and precision tech workflows.'}
          </p>

          <div className="pt-1">
            <RatingStars rating={product.averageRating} reviewCount={product.reviewCount} />
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-medium">Price</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleWishlist}
              disabled={isWishlistPending}
              className="hidden sm:inline-flex p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {isWishlistPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              ) : (
                <Heart className={`w-4 h-4 ${isWishlisted ? 'text-rose-500 fill-rose-500' : ''}`} />
              )}
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-semibold text-xs shadow-md shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-brand-500/60 dark:hover:border-brand-400/60 rounded-3xl p-4 flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-xl dark:hover:shadow-brand-500/5 transition-all duration-300"
    >
      <div>
        {/* Image Container */}
        <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 mb-4 border border-slate-200/60 dark:border-slate-800/60">
          <img
            src={imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Wishlist Button Overlay */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            disabled={isWishlistPending}
            className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700/60 transition-colors z-10 disabled:opacity-50 shadow-sm cursor-pointer"
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            {isWishlistPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <Heart className={`w-4 h-4 ${isWishlisted ? 'text-rose-500 fill-rose-500' : ''}`} />
            )}
          </button>

          {/* Stock Badge Overlay */}
          <div className="absolute bottom-3 left-3 z-10">
            {getStockBadge()}
          </div>
        </div>

        {/* Category */}
        <div className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
          {product.categoryName}
        </div>

        {/* Product Title */}
        <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors text-base line-clamp-1 mb-1.5">
          {product.name}
        </h3>

        {/* Description snippet */}
        <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-3">
          {product.description || 'High-performance hardware engineered for precision.'}
        </p>

        {/* Rating Stars */}
        <div className="mb-4">
          <RatingStars rating={product.averageRating} reviewCount={product.reviewCount} />
        </div>
      </div>

      {/* Footer Price & Add to Cart */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-medium">Price</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            ${Number(product.price).toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isAddingToCart}
          className="p-3 rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 cursor-pointer"
          title="Add to Cart"
          aria-label="Add to Cart"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
