import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
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
  Maximize2,
  Share2,
  Cpu,
} from 'lucide-react';
import { toast } from 'sonner';
import { productApi } from '../api/productApi';
import { getProductImages } from '../utils/productImages';
import RatingStars from '../components/common/RatingStars';
import { useCart } from '../hooks/useCart';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlist } from '../hooks/useWishlist';
import ProductReviews from '../components/product/ProductReviews';
import { ProductCard } from '../components/product/ProductCard';
import { ErrorState } from '../components/ui/ErrorState';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Tabs } from '../components/ui/Tabs';
import { SEO } from '../components/common/SEO';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();

  const { addToCart, isAddingToCart } = useCart();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openMiniCart = useCartStore((state) => state.openMiniCart);
  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlist();

  // State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');

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

  // Fetch related products in the same category
  const { data: relatedData } = useQuery({
    queryKey: ['related-products', product?.categoryId],
    queryFn: () => productApi.getProducts({ categoryId: product?.categoryId, size: 5 }),
    enabled: !!product?.categoryId,
  });

  const relatedProducts = (relatedData?.content || [])
    .filter((p) => p.id !== productId)
    .slice(0, 4);

  const images = product ? getProductImages(product) : [];
  const currentImage = images[selectedImageIndex] || images[0] || '';

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

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product?.name || 'TechNest Product',
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  // Stock badge helper
  const getStockBadge = () => {
    if (!product) return null;
    if (product.stock === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
          <XCircle className="w-3.5 h-3.5" /> Out of Stock
        </span>
      );
    }
    if (product.stock <= 5) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
          <AlertCircle className="w-3.5 h-3.5" /> Only {product.stock} units remaining
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
        <CheckCircle className="w-3.5 h-3.5" /> In Stock & Ready to Ship
      </span>
    );
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-8">
        <div className="w-40 h-6 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6 h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="lg:col-span-6 space-y-6">
            <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-3/4 h-10 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-48 h-10 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-full h-24 bg-slate-200 dark:bg-slate-800 rounded" />
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
          description={
            (error as Error)?.message ||
            'The requested product could not be retrieved from the backend catalog.'
          }
          onRetry={() => refetch()}
          action={
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
              <Link to="/products">
                <Button variant="primary" size="sm">
                  Back to Catalog
                </Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const tabItems = [
    {
      id: 'specs',
      label: 'Specifications',
      content: (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
          <table className="w-full text-xs sm:text-sm text-left">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              <tr>
                <td className="py-3 font-semibold text-slate-500 dark:text-slate-400 w-1/3">Category</td>
                <td className="py-3 font-bold text-slate-900 dark:text-white">{product.categoryName}</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-slate-500 dark:text-slate-400">Model SKU / ID</td>
                <td className="py-3 font-mono font-bold text-brand-600 dark:text-brand-400">#{product.id}</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-slate-500 dark:text-slate-400">Inventory Stock</td>
                <td className="py-3 text-slate-700 dark:text-slate-200 font-semibold">{product.stock} units available</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-slate-500 dark:text-slate-400">Customer Rating</td>
                <td className="py-3 text-slate-700 dark:text-slate-200">
                  {product.averageRating.toFixed(1)} / 5.0 ({product.reviewCount} reviews)
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-slate-500 dark:text-slate-400">Release Catalog Year</td>
                <td className="py-3 text-slate-700 dark:text-slate-200">
                  {product.createdAt ? new Date(product.createdAt).getFullYear() : '2026'}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-slate-500 dark:text-slate-400">Warranty Support</td>
                <td className="py-3 text-slate-700 dark:text-slate-200">12 Months Official Manufacturer Warranty</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-slate-500 dark:text-slate-400">Return Policy</td>
                <td className="py-3 text-slate-700 dark:text-slate-200">30-Day Hassle-Free Returns & Replacements</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 'reviews',
      label: `Reviews (${product.reviewCount})`,
      content: (
        <ProductReviews
          productId={product.id}
          averageRating={product.averageRating}
          reviewCount={product.reviewCount}
        />
      ),
    },
    {
      id: 'shipping',
      label: 'Shipping & Delivery',
      content: (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Fast & Insured Delivery</h4>
              <p className="mt-1">
                All hardware shipments are handled via climate-controlled express logistics with full transit insurance. Orders placed before 3:00 PM are dispatched same day.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Tamper-Proof Packaging</h4>
              <p className="mt-1">
                Each product is sealed in reinforced antistatic containers to prevent any transit electrostatic or physical impact damage.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'warranty',
      label: 'Warranty & Returns',
      content: (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">30-Day Money-Back Guarantee</h4>
              <p className="mt-1">
                If you are not completely satisfied with your purchase, return it within 30 days of receipt in original condition for a full refund or exchange.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">1-Year Comprehensive Warranty</h4>
              <p className="mt-1">
                Covers component failure, defect replacements, and official firmware support. Reach our certified repair network anytime.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <SEO
        title={`${product.name} — Buy Online`}
        description={product.description || `Buy ${product.name} at TechNest. Fast shipping, guaranteed authentic, and official manufacturer warranty.`}
        canonicalUrl={`${window.location.origin}/products/${product.id}`}
        ogImage={images[0]}
        ogType="product"
        productData={{
          name: product.name,
          description: product.description,
          price: product.price,
          currency: 'LKR',
          stock: product.stock,
          category: product.categoryName,
          image: images[0],
          averageRating: product.averageRating,
          reviewCount: product.reviewCount,
        }}
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Products', item: '/products' },
          { name: product.categoryName, item: `/products?categoryId=${product.categoryId}` },
          { name: product.name, item: `/products/${product.id}` },
        ]}
      />
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Catalog
          </Link>
          <span>/</span>
          <Link
            to={`/products?categoryId=${product.categoryId}`}
            className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900 dark:text-white line-clamp-1 max-w-[200px] sm:max-w-md">
            {product.name}
          </span>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-brand-600 transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </div>

      {/* Main Product Showcase: Gallery + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Image */}
          <div className="relative w-full h-80 sm:h-[480px] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm group">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />

            {/* Zoom Lightbox Trigger */}
            <button
              type="button"
              onClick={() => setIsZoomModalOpen(true)}
              className="absolute top-4 right-4 p-2.5 rounded-2xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
              title="Fullscreen Zoom"
              aria-label="Fullscreen Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* In-Stock Badge */}
            <div className="absolute bottom-4 left-4">{getStockBadge()}</div>
          </div>

          {/* Thumbnail Selector Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border-2 transition-all flex-shrink-0 cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-brand-500 shadow-md ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Purchase Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 text-brand-700 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" /> {product.categoryName}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-3 pt-1">
              <RatingStars rating={product.averageRating} reviewCount={product.reviewCount} />
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                {product.reviewCount} Verified Reviews
              </button>
            </div>
          </div>

          {/* Price Block */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Price</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                ${Number(product.price).toFixed(2)}
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1 rounded-full">
              In Stock & Verified
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.description ||
              'High-grade hardware built with ultra-reliable engineering standards, optimized for intensive productivity and creative computing.'}
          </p>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Quantity:
              </span>
              <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-xs font-bold text-slate-900 dark:text-white font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                  disabled={quantity >= product.stock}
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAddingToCart}
                isLoading={isAddingToCart}
                icon={ShoppingBag}
                className="flex-1 shadow-lg shadow-brand-500/25"
              >
                Add to Cart
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                icon={Zap}
                className="flex-1 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-500/30 hover:bg-brand-100"
              >
                Buy Now
              </Button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                disabled={isWishlistPending}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-500'
                }`}
                title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
              >
                {isWishlistPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                )}
              </button>
            </div>
          </div>

          {/* Quick Assurance List */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
              <Truck className="w-4 h-4 text-brand-600 dark:text-brand-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Fast Dispatch</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">1-Yr Warranty</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
              <RotateCcw className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <section className="pt-8 space-y-6">
        <Tabs tabs={tabItems} activeTab={activeTab} onChange={(id) => setActiveTab(id)} />
        <div className="pt-2">
          {tabItems.find((t) => t.id === activeTab)?.content}
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-12 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                Explore More
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Related {product.categoryName}
              </h3>
            </div>
            <Link
              to={`/products?categoryId=${product.categoryId}`}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View Category →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Fullscreen Zoom Lightbox Modal */}
      <Modal isOpen={isZoomModalOpen} onClose={() => setIsZoomModalOpen(false)} size="xl">
        <div className="relative max-h-[80vh] flex items-center justify-center p-4">
          <img
            src={currentImage}
            alt={product.name}
            className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl"
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetailPage;
