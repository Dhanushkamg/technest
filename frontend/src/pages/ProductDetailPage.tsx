import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ShoppingBag,
  Heart,
  Zap,
  CheckCircle,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { productApi } from '../api/productApi';
import { getProductImage } from '../utils/productImages';
import RatingStars from '../components/common/RatingStars';
import { useCart } from '../hooks/useCart';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlist } from '../hooks/useWishlist';
import ProductReviews from '../components/product/ProductReviews';
import { ErrorState } from '../components/ui/ErrorState';
import { Button } from '../components/ui/Button';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();

  const { addToCart, isAddingToCart } = useCart();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openMiniCart = useCartStore((state) => state.openMiniCart);
  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  const isWishlisted = isInWishlist(productId);
  const isWishlistPending = isAddingToWishlist || isRemovingFromWishlist;

  // Fetch product by ID
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productApi.getProductById(productId),
    enabled: !!productId && !isNaN(productId),
  });

  const imageUrl = imgError
    ? 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
    : product
    ? getProductImage(product)
    : '';

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      navigate('/login');
      return;
    }
    if (!product) return;

    try {
      await addToCart({ productId: product.id, quantity });
      toast.success(`Added ${quantity} × ${product.name} to cart!`);
      openMiniCart();
    } catch {
      // Handled in axios interceptor
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to proceed to checkout');
      navigate('/login');
      return;
    }
    if (!product) return;

    try {
      await addToCart({ productId: product.id, quantity });
      navigate('/cart');
    } catch {
      // Handled in axios interceptor
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to manage your wishlist');
      navigate('/login');
      return;
    }
    if (!product) return;

    try {
      await toggleWishlist(product.id, product.name);
    } catch {
      // Handled in hook
    }
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="w-full h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="space-y-6">
            <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-3/4 h-8 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-48 h-10 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-full h-24 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-full h-14 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (isError || !product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <ErrorState
          title="Product Not Found"
          description={(error as Error)?.message || 'The requested product could not be retrieved from the backend server.'}
          onRetry={() => refetch()}
          action={
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
              <Link to="/products">
                <Button variant="primary" size="sm">Back to Products</Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const getStockBadge = () => {
    if (product.stock === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-rose-950/80 text-red-700 dark:text-rose-400 border border-red-200 dark:border-rose-800/50">
          <XCircle className="w-4 h-4" /> Out of Stock
        </span>
      );
    }
    if (product.stock <= 5) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
          <AlertCircle className="w-4 h-4" /> Only {product.stock} left in stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
        <CheckCircle className="w-4 h-4" /> In Stock ({product.stock} available)
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back to Products Nav */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Product Catalog
      </Link>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Product Image */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-md dark:shadow-2xl p-6 group">
          <img
            src={imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-96 sm:h-[450px] object-cover rounded-2xl transition-transform duration-500"
          />

          {/* Wishlist Floating Button */}
          <button
            onClick={handleToggleWishlist}
            disabled={isWishlistPending}
            className="absolute top-9 right-9 p-3 rounded-2xl bg-white/90 dark:bg-slate-950/80 backdrop-blur-md text-slate-500 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700/60 shadow-lg transition-all disabled:opacity-50"
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            {isWishlistPending ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            ) : (
              <Heart className={`w-5 h-5 ${isWishlisted ? 'text-rose-500 fill-rose-500' : ''}`} />
            )}
          </button>
        </div>

        {/* Right: Product Info */}
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 text-brand-700 dark:text-brand-400 text-xs font-semibold uppercase tracking-wider mb-3">
              {product.categoryName}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              <RatingStars rating={product.averageRating} reviewCount={product.reviewCount} size="md" />
              <span className="text-slate-300 dark:text-slate-600">|</span>
              {getStockBadge()}
            </div>
          </div>

          {/* Price */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-baseline gap-3">
            <span className="text-4xl font-black text-slate-900 dark:text-white">
              ${Number(product.price).toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Included taxes & warranty</span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Overview</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {product.description ||
                'Engineered with cutting-edge materials and precision specs to deliver unmatched tech performance for power users and enthusiasts.'}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Quantity:</span>
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-bold text-slate-900 dark:text-white text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                disabled={quantity >= (product.stock || 99)}
                aria-label="Increase quantity"
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              isLoading={isAddingToCart}
              leftIcon={<ShoppingBag className="w-5 h-5" />}
            >
              Add to Cart
            </Button>

            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              isLoading={isAddingToCart}
              leftIcon={<Zap className="w-5 h-5" />}
            >
              Buy Now
            </Button>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 dark:border-slate-800/80 text-center">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60">
              <Truck className="w-5 h-5 text-brand-500 dark:text-brand-400 mx-auto mb-1" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Fast Delivery</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Ships within 24h</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60">
              <ShieldCheck className="w-5 h-5 text-brand-500 dark:text-brand-400 mx-auto mb-1" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">2-Year Warranty</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Full coverage</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60">
              <RotateCcw className="w-5 h-5 text-brand-500 dark:text-brand-400 mx-auto mb-1" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">30-Day Returns</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Hassle free</span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Product Reviews & Ratings Section */}
      <ProductReviews
        productId={product.id}
        averageRating={product.averageRating}
        reviewCount={product.reviewCount}
      />
    </div>
  );
};

export default ProductDetailPage;
