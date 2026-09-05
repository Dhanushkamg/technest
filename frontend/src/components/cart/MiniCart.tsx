import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, ArrowRight, PackageOpen, Minus, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../../hooks/useCart';
import { getProductImage } from '../../utils/productImages';
import type { CartItem } from '../../types';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { EmptyState } from '../ui/EmptyState';

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
      className="flex gap-4 py-4 border-b border-slate-200 dark:border-slate-800 last:border-0"
    >
      {/* Product Image */}
      <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <img
          src={imageUrl}
          alt={item.productName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Item Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 mb-0.5">{item.productName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">${Number(item.price).toFixed(2)} each</p>
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => onUpdate(item.id, item.quantity - 1)}
              disabled={isDisabled || item.quantity <= 1}
              aria-label="Decrease quantity"
              className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center text-xs font-bold text-slate-900 dark:text-white">
              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : item.quantity}
            </span>
            <button
              onClick={() => onUpdate(item.id, item.quantity + 1)}
              disabled={isDisabled}
              aria-label="Increase quantity"
              className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Subtotal + Remove */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-brand-600 dark:text-brand-400">${subtotal}</span>
            <IconButton
              icon={<Trash2 className="w-4 h-4" />}
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.id)}
              disabled={isDisabled}
              isLoading={isRemoving}
              aria-label="Remove item"
              className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const MiniCart: React.FC<MiniCartProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
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

  const drawerTitle = (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800/50 flex items-center justify-center">
        <ShoppingBag className="w-4 h-4 text-brand-600 dark:text-brand-400" />
      </div>
      <div>
        <h2 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">Your Cart</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
      </div>
    </div>
  );

  const drawerFooter = items.length > 0 ? (
    <div className="space-y-4">
      {/* Subtotal */}
      <div className="flex items-center justify-between">
        <span className="text-slate-600 dark:text-slate-300 font-medium">Subtotal</span>
        <span className="text-xl font-black text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleCheckout}
          variant="primary"
          className="w-full flex items-center justify-center gap-2"
        >
          View Cart & Checkout <ArrowRight className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => { onClose(); navigate('/products'); }}
          variant="outline"
          className="w-full"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      size="md"
      title={drawerTitle}
      footer={drawerFooter}
      contentClassName={items.length === 0 ? "flex items-center justify-center p-6" : "p-6"}
    >
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 py-2 animate-pulse">
              <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="Your cart is empty"
          description="Add some products to get started."
          action={{
            label: 'Continue Shopping',
            onClick: () => { onClose(); navigate('/products'); }
          }}
        />
      ) : (
        <div className="flex flex-col">
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
        </div>
      )}
    </Drawer>
  );
};

export default MiniCart;
