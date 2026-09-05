import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Loader2, PackageOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { useCartStore } from '../../store/useCartStore';
import { getProductImage } from '../../utils/productImages';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { wishlistItems, isLoading, removeFromWishlist, isRemovingFromWishlist } = useWishlist();
  const { addToCart, isAddingToCart } = useCart();
  const openMiniCart = useCartStore((state) => state.openMiniCart);

  const [removingId, setRemovingId] = React.useState<number | null>(null);

  const handleRemove = async (productId: number, name: string) => {
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
      toast.info(`Removed "${name}" from wishlist.`);
    } catch {
      // handled in hook
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (productId: number, name: string) => {
    try {
      await addToCart({ productId, quantity: 1 });
      toast.success(`Added "${name}" to cart!`);
      openMiniCart();
    } catch {
      // handled in hook
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
        <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors mb-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" /> Saved Items ({wishlistItems.length})
          </h1>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="Your Wishlist is Empty"
          description="Keep track of items you love. Click the heart icon on any product to save it here for later."
          action={{
            label: 'Explore Products',
            onClick: () => navigate('/products'),
            icon: <ShoppingBag className="w-4 h-4" />,
          }}
        />
      ) : (
        // Wishlist Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {wishlistItems.map((item) => {
              const imageUrl = getProductImage({ id: item.productId, name: item.productName });
              const isRemovingThis = isRemovingFromWishlist && removingId === item.productId;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/90 hover:border-brand-300 dark:hover:border-brand-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md dark:shadow-none transition-all group"
                >
                  <div>
                    {/* Product Image */}
                    <div
                      onClick={() => navigate(`/products/${item.productId}`)}
                      className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 mb-3 border border-slate-200 dark:border-slate-800/60 cursor-pointer"
                    >
                      <img
                        src={imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item.productId, item.productName);
                        }}
                        disabled={isRemovingThis}
                        className="absolute top-2 right-2 p-2 rounded-xl bg-white/90 dark:bg-slate-950/80 backdrop-blur-md text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 transition-colors z-10"
                        title="Remove from Wishlist"
                      >
                        {isRemovingThis ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => navigate(`/products/${item.productId}`)}
                      className="font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-300 transition-colors text-sm line-clamp-1 cursor-pointer mb-2"
                    >
                      {item.productName}
                    </h3>

                    {/* Price */}
                    <p className="text-lg font-black text-slate-900 dark:text-white mb-4">
                      ${Number(item.price).toFixed(2)}
                    </p>
                  </div>

                  {/* Add to Cart Action */}
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAddToCart(item.productId, item.productName)}
                    disabled={isAddingToCart}
                    leftIcon={<ShoppingBag className="w-4 h-4" />}
                  >
                    Move to Cart
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
