import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { Product } from '../../types';
import { getProductImage } from '../../utils/productImages';
import { RatingStars } from '../common/RatingStars';
import { useCart } from '../../hooks/useCart';
import { useAuthStore } from '../../store/useAuthStore';
import { wishlistApi } from '../../api/wishlistApi';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, isAddingToCart } = useCart();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);

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
      if (isWishlisted) {
        setIsWishlisted(false);
        toast.info(`Removed ${product.name} from wishlist`);
      } else {
        await wishlistApi.addToWishlist(product.id);
        setIsWishlisted(true);
        toast.success(`Added ${product.name} to wishlist!`);
      }
    } catch {
      // Handled in axios interceptor
    }
  };

  // Stock status determination
  const getStockBadge = () => {
    if (product.stock === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/50">
          <XCircle className="w-3 h-3" /> Out of Stock
        </span>
      );
    }
    if (product.stock <= 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/50">
          <AlertCircle className="w-3 h-3" /> Only {product.stock} left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
        <CheckCircle className="w-3 h-3" /> In Stock
      </span>
    );
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-slate-900/70 border border-slate-800/90 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 backdrop-blur-xl"
    >
      <div>
        {/* Image Container */}
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-950 mb-4 border border-slate-800/60">
          <img
            src={imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Wishlist Button Overlay */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-rose-400 border border-slate-700/60 transition-colors z-10"
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'text-rose-500 fill-rose-500' : ''}`} />
          </button>

          {/* Stock Badge Overlay */}
          <div className="absolute bottom-3 left-3 z-10">
            {getStockBadge()}
          </div>
        </div>

        {/* Category */}
        <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
          {product.categoryName}
        </div>

        {/* Product Title */}
        <h3 className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors text-base line-clamp-1 mb-2">
          {product.name}
        </h3>

        {/* Description snippet */}
        <p className="text-slate-400 text-xs line-clamp-2 mb-3">
          {product.description || 'High-performance hardware engineered for precision.'}
        </p>

        {/* Rating Stars */}
        <div className="mb-4">
          <RatingStars rating={product.averageRating} reviewCount={product.reviewCount} />
        </div>
      </div>

      {/* Footer Price & Add to Cart */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
        <div>
          <span className="text-xs text-slate-400 block font-medium">Price</span>
          <span className="text-xl font-black text-white bg-gradient-to-r from-white to-cyan-300 bg-clip-text">
            ${Number(product.price).toFixed(2)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isAddingToCart}
          className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
          title="Add to Cart"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
