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
  AlertTriangle,
  RefreshCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../../hooks/useCart';
import { getProductImage } from '../../utils/productImages';
import type { CartItem } from '../../types';

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
  const isDisabled = isUpdating || isRemoving;

  const handleQtyChange = async (newQty: number) => {
    if (newQty < 1 || newQty === item.quantity) return;
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
      className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl hover:border-slate-700/80 transition-all backdrop-blur-xl"
    >
      {/* Product Image */}
      <div className="w-full sm:w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/40">
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
          <p className="text-base font-bold text-slate-100">{item.productName}</p>
          <p className="text-xs text-cyan-400 mt-0.5">Unit price: ${Number(item.price).toFixed(2)}</p>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700/60 rounded-xl p-1">
            <button
              onClick={() => handleQtyChange(localQty - 1)}
              disabled={isDisabled || localQty <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="w-10 text-center font-bold text-white text-sm">
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto text-cyan-400" />
              ) : (
                localQty
              )}
            </span>

            <button
              onClick={() => handleQtyChange(localQty + 1)}
              disabled={isDisabled}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Subtotal + Remove */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Subtotal</span>
              <span className="text-lg font-black text-white">${subtotal}</span>
            </div>
            <button
              onClick={handleRemove}
              disabled={isDisabled}
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-rose-800/40 transition-all"
              title="Remove item"
            >
              {isRemoving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
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
        className="flex gap-4 p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl animate-pulse"
      >
        <div className="w-28 h-28 rounded-xl bg-slate-800 flex-shrink-0" />
        <div className="flex-1 space-y-3 pt-1">
          <div className="h-4 bg-slate-800 rounded w-2/3" />
          <div className="h-3 bg-slate-800 rounded w-1/4" />
          <div className="flex justify-between items-center mt-auto">
            <div className="h-8 bg-slate-800 rounded-xl w-28" />
            <div className="h-8 bg-slate-800 rounded w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ─── Clear Cart Confirmation Dialog ──────────────────────────────────────────
const ClearCartDialog: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isClearing: boolean;
}> = ({ isOpen, onConfirm, onCancel, isClearing }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          onClick={onCancel}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Clear Cart?</h3>
            <p className="text-sm text-slate-400 text-center mb-6">
              All items will be removed from your cart. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={isClearing}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isClearing}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isClearing ? 'Clearing...' : 'Clear Cart'}
              </button>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
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
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Unable to Load Cart</h2>
        <p className="text-slate-400 text-sm mb-6">Failed to fetch your cart from the server.</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
        >
          <RefreshCcw className="w-4 h-4" /> Retry
        </button>
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
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-3 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-black text-white">
            Shopping Cart
            {!isLoading && totalItems > 0 && (
              <span className="ml-3 text-lg font-semibold text-slate-400">
                ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </span>
            )}
          </h1>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => setShowClearDialog(true)}
            disabled={isClearingCart}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-rose-400 border border-rose-800/40 hover:bg-rose-950/30 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Clear Cart
          </button>
        )}
      </div>

      {isLoading ? (
        <CartSkeleton />
      ) : items.length === 0 ? (
        // ── Empty State
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-6">
            <PackageOpen className="w-11 h-11 text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
          <p className="text-slate-400 text-sm max-w-sm mb-8">
            Looks like you haven't added anything yet. Browse our products and find something you love.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-500/25"
          >
            <ShoppingBag className="w-4 h-4" /> Browse Products
          </Link>
        </motion.div>
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
              className="sticky top-28 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl"
            >
              <h2 className="text-lg font-bold text-white mb-5 pb-4 border-b border-slate-800">
                Order Summary
              </h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Items ({totalItems})</span>
                  <span className="text-slate-200 font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Shipping</span>
                  <span className="text-emerald-400 font-medium text-xs">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-t border-slate-800 mb-6">
                <span className="text-white font-bold text-base">Subtotal</span>
                <span className="text-2xl font-black text-white">${subtotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/25"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-slate-500 text-center mt-3">
                Taxes and final shipping calculated at checkout
              </p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation */}
      <ClearCartDialog
        isOpen={showClearDialog}
        onConfirm={handleClearCart}
        onCancel={() => setShowClearDialog(false)}
        isClearing={isClearingCart}
      />
    </div>
  );
};

export default CartPage;
