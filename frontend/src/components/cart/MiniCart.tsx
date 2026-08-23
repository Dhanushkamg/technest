import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, ArrowRight, PackageOpen, Minus, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../../hooks/useCart';
import { getProductImage } from '../../utils/productImages';
import type { CartItem } from '../../types';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const MiniCartItem: React.FC<{
  item: CartItem;
  onRemove: (id: number) => void;
  onUpdate: (id: number, qty: number) => void;
  isRemoving: boolean;
  isUpdating: boolean;
}> = ({ item, onRemove, onUpdate, isRemoving, isUpdating }) => {
  const imageUrl = getProductImage({ id: item.productId, name: item.productName });
  const subtotal = (Number(item.price) * item.quantity).toFixed(2);
  const isDisabled = isRemoving || isUpdating;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 py-3 border-b border-slate-800/70 last:border-0"
    >
      {/* Product Image */}
      <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/50">
        <img
          src={imageUrl}
          alt={item.productName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-100 line-clamp-1 mb-1">{item.productName}</p>
        <p className="text-xs text-slate-400 mb-2">${Number(item.price).toFixed(2)} each</p>

        <div className="flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => onUpdate(item.id, item.quantity - 1)}
              disabled={isDisabled || item.quantity <= 1}
              className="w-6 h-6 rounded-md flex items-center justify-center text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center text-xs font-bold text-white">
              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : item.quantity}
            </span>
            <button
              onClick={() => onUpdate(item.id, item.quantity + 1)}
              disabled={isDisabled}
              className="w-6 h-6 rounded-md flex items-center justify-center text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Subtotal + Remove */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-cyan-400">${subtotal}</span>
            <button
              onClick={() => onRemove(item.id)}
              disabled={isDisabled}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 disabled:opacity-30 transition-colors"
              title="Remove item"
            >
              {isRemoving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const MiniCart: React.FC<MiniCartProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    cart,
    isLoading,
    removeFromCart,
    isRemovingFromCart,
    removingItemId,
    updateCartItem,
    isUpdatingCartItem,
    updatingItemId,
  } = useCart();

  const items = cart?.items ?? [];
  const subtotal = items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleRemove = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch {
      // handled by hook
    }
  };

  const handleUpdate = async (itemId: number, qty: number) => {
    if (qty < 1) return;
    try {
      await updateCartItem({ itemId, quantity: qty });
    } catch {
      // handled by hook
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">Your Cart</h2>
                  <p className="text-xs text-slate-400">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-2">
              {isLoading ? (
                <div className="flex flex-col gap-3 pt-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 py-3 animate-pulse">
                      <div className="w-16 h-16 rounded-xl bg-slate-800 flex-shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 bg-slate-800 rounded w-3/4" />
                        <div className="h-3 bg-slate-800 rounded w-1/3" />
                        <div className="h-6 bg-slate-800 rounded w-1/2 mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                // Empty State
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-64 text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4">
                    <PackageOpen className="w-9 h-9 text-slate-500" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">Your cart is empty</h3>
                  <p className="text-slate-400 text-sm mb-6">Add some products to get started.</p>
                  <button
                    onClick={() => { onClose(); navigate('/products'); }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all"
                  >
                    Continue Shopping
                  </button>
                </motion.div>
              ) : (
                // Cart Items
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <MiniCartItem
                      key={item.id}
                      item={item}
                      onRemove={handleRemove}
                      onUpdate={handleUpdate}
                      isRemoving={isRemovingFromCart && removingItemId === item.id}
                      isUpdating={isUpdatingCartItem && updatingItemId === item.id}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-slate-800 p-5 space-y-4 bg-slate-900/90 backdrop-blur-md">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Subtotal</span>
                  <span className="text-xl font-black text-white">${subtotal.toFixed(2)}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/25"
                  >
                    View Cart & Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { onClose(); navigate('/products'); }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-sm transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MiniCart;
