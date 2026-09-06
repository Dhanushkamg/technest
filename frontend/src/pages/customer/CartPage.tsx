import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  PackageOpen,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../../hooks/useCart';
import { getProductImage } from '../../utils/productImages';
import type { CartItem } from '../../types';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';

// ─── Cart Item Row ────────────────────────────────────────────────────────────
const CartItemRow: React.FC<{
  item: CartItem;
  onUpdate: (itemId: number, qty: number) => Promise<void>;
  onRemove: (itemId: number) => Promise<void>;
  isUpdating: boolean;
  isRemoving: boolean;
}> = ({ item, onUpdate, onRemove, isUpdating, isRemoving }) => {
  const [localQty, setLocalQty] = useState(item.quantity);
  const imageUrl = getProductImage({ id: item.productId, name: item.productName });
  const subtotal = (Number(item.price) * item.quantity).toFixed(2);
  const maxStock = item.stockQuantity;
  const isAtMaxStock = maxStock !== undefined && localQty >= maxStock;
  const isDisabled = isUpdating || isRemoving;

  const handleQtyChange = async (newQty: number) => {
    if (newQty < 1 || newQty === item.quantity) return;
    if (maxStock !== undefined && newQty > maxStock) {
      toast.error(`Only ${maxStock} items available in stock`);
      return;
    }
    setLocalQty(newQty);
    try {
      await onUpdate(item.id, newQty);
    } catch {
      setLocalQty(item.quantity); // revert on error
    }
  };

  const handleRemove = async () => {
    try {
      await onRemove(item.id);
      toast.success(`Removed ${item.productName} from cart`);
    } catch {
      // handled by hook
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700/80 transition-all shadow-sm"
    >
      {/* Product Image */}
      <div className="w-full sm:w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/40">
        <img
          src={imageUrl}
          alt={item.productName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Item Content */}
      <div className="flex-1 flex flex-col justify-between gap-3">
        <div>
          <p className="text-base font-bold text-slate-900 dark:text-slate-100">{item.productName}</p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-xs text-brand-600 dark:text-brand-400">Unit price: ${Number(item.price).toFixed(2)}</span>
            {maxStock !== undefined && maxStock <= 5 && maxStock > 0 && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Only {maxStock} left in stock
              </span>
            )}
            {maxStock !== undefined && maxStock === 0 && (
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                Out of stock
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-1">
            <button
              onClick={() => handleQtyChange(localQty - 1)}
              disabled={isDisabled || localQty <= 1}
              aria-label="Decrease quantity"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="w-10 text-center font-bold text-slate-900 dark:text-white text-sm">
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto text-brand-500" />
              ) : (
                localQty
              )}
            </span>

            <button
              onClick={() => handleQtyChange(localQty + 1)}
              disabled={isDisabled || isAtMaxStock}
              aria-label="Increase quantity"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Subtotal + Remove */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-500 block">Subtotal</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">${subtotal}</span>
            </div>
            <IconButton
              icon={isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              variant="ghost"
              onClick={handleRemove}
              disabled={isDisabled}
              aria-label="Remove item"
              className="text-slate-400 hover:text-red-600 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-red-200 dark:hover:border-rose-800/40"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Cart Skeleton ────────────────────────────────────────────────────────────
const CartSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="flex gap-4 p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl animate-pulse"
      >
        <div className="w-28 h-28 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
        <div className="flex-1 space-y-3 pt-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="flex justify-between items-center mt-auto">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-28" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ─── Full Cart Page ───────────────────────────────────────────────────────────
export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const {
    cart,
    isLoading,
    isError,
    refetch,
    updateCartItem,
    isUpdatingCartItem,
    updatingItemId,
    removeFromCart,
    isRemovingFromCart,
    removingItemId,
    clearCart,
    isClearingCart,
  } = useCart();

  const items = cart?.items ?? [];
  const subtotal = items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleClearCart = async () => {
    try {
      await clearCart();
      setShowClearDialog(false);
      toast.success('Cart cleared');
    } catch {
      setShowClearDialog(false);
    }
  };

  // ── Error State
  if (isError) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <ErrorState
          title="Unable to Load Cart"
          description="Failed to fetch your cart from the server."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors mb-3 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Shopping Cart
            {!isLoading && totalItems > 0 && (
              <span className="ml-3 text-lg font-semibold text-slate-500 dark:text-slate-400">
                ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </span>
            )}
          </h1>
        </div>

        {items.length > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowClearDialog(true)}
            disabled={isClearingCart}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Clear Cart
          </Button>
        )}
      </div>

      {isLoading ? (
        <CartSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Browse our products and find something you love."
          action={{
            label: 'Browse Products',
            onClick: () => navigate('/products'),
            icon: <ShoppingBag className="w-4 h-4" />,
          }}
        />
      ) : (
        // ── Cart Layout
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdate={async (id, qty) => { await updateCartItem({ itemId: id, quantity: qty }); }}
                  onRemove={async (id) => { await removeFromCart(id); }}
                  isUpdating={isUpdatingCartItem && updatingItemId === item.id}
                  isRemoving={isRemovingFromCart && removingItemId === item.id}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-24 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-none"
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
                Order Summary
              </h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Items ({totalItems})</span>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Shipping</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-t border-slate-200 dark:border-slate-800 mb-6">
                <span className="text-slate-900 dark:text-white font-bold text-base">Subtotal</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/checkout')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Checkout
              </Button>

              <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-3">
                Taxes and final shipping calculated at checkout
              </p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation */}
      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearCart}
        title="Clear Cart?"
        description="All items will be removed from your cart. This cannot be undone."
        confirmLabel="Clear Cart"
        confirmVariant="danger"
        isLoading={isClearingCart}
      />
    </div>
  );
};

export default CartPage;
