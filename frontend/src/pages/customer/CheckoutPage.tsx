import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  CheckCircle2,
  Plus,
  ShoppingBag,
  CreditCard,
  Banknote,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Tag,
  PackageOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../../api/authApi';
import { orderApi } from '../../api/orderApi';
import { paymentApi } from '../../api/paymentApi';
import { useCart } from '../../hooks/useCart';
import { useCartStore } from '../../store/useCartStore';
import { getProductImage } from '../../utils/productImages';
import type { Address } from '../../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cart, isLoading: isCartLoading } = useCart();
  const updateCartCount = useCartStore((state) => state.updateCount);

  // Form State
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'CASH_ON_DELIVERY' | 'PAYPAL'>('CREDIT_CARD');
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // New Address Form Modal State
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'United States',
    isDefault: false,
  });

  // Fetch saved delivery addresses
  const {
    data: addresses = [],
    isLoading: isAddressesLoading,
    refetch: refetchAddresses,
  } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: authApi.getAddresses,
  });

  // Set initial selected address when addresses load
  React.useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  // Add Address Mutation
  const addAddressMutation = useMutation({
    mutationFn: authApi.addAddress,
    onSuccess: (createdAddress) => {
      toast.success('Shipping address saved!');
      setShowAddAddressModal(false);
      setSelectedAddressId(createdAddress.id);
      refetchAddresses();
      setNewAddress({
        fullName: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: '',
        country: 'United States',
        isDefault: false,
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save address.');
    },
  });

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  // Apply Coupon (local state check)
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setAppliedCoupon(couponCodeInput.trim().toUpperCase());
    toast.success(`Coupon "${couponCodeInput.trim().toUpperCase()}" applied!`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    toast.info('Coupon removed.');
  };

  // Submit Order & Payment Flow
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select or add a shipping address.');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // 1. Create Backend Order
      const order = await orderApi.createOrder({
        addressId: selectedAddressId,
        couponCode: appliedCoupon || undefined,
      });

      // 2. Create & Confirm Payment on Backend
      await paymentApi.createPayment({
        orderId: order.id,
        amount: order.totalAmount,
        paymentMethod: paymentMethod,
      });

      // 3. Invalidate Cart and Orders
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      updateCartCount(0);

      toast.success('Order placed successfully!');

      // 4. Navigate to Order Confirmation
      navigate(`/order-success/${order.id}`);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to place order. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Loading Skeleton State
  if (isCartLoading || isAddressesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="w-48 h-8 bg-slate-800 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-slate-900 border border-slate-800 rounded-2xl p-6" />
            <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl p-6" />
          </div>
          <div className="h-80 bg-slate-900 border border-slate-800 rounded-2xl p-6" />
        </div>
      </div>
    );
  }

  // Empty Cart Guard
  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-6 text-slate-500">
          <PackageOpen className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
        <p className="text-slate-400 text-sm mb-8">
          You need items in your shopping cart before you can proceed to checkout.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all"
        >
          <ShoppingBag className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Nav */}
      <div className="mb-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors mb-3 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Return to Shopping Cart
        </Link>
        <h1 className="text-3xl font-black text-white tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Address & Review & Payment */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Delivery Address */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
                  1
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-400" /> Shipping Address
                </h2>
              </div>
              <button
                onClick={() => setShowAddAddressModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs transition-colors border border-slate-700/60"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                <p className="text-slate-400 text-sm mb-4">No saved addresses found. Please add a shipping address to continue.</p>
                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs transition-colors"
                >
                  + Add Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-950/30 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-bold text-white text-sm line-clamp-1">{addr.fullName}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-1">{addr.addressLine1}</p>
                      {addr.addressLine2 && <p className="text-xs text-slate-400 line-clamp-1">{addr.addressLine2}</p>}
                      <p className="text-xs text-slate-400 mt-1">
                        {addr.city}, {addr.postalCode}, {addr.country}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-2 font-mono">{addr.phoneNumber}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Order Items Review */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
                2
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-cyan-400" /> Order Review ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)
              </h2>
            </div>

            <div className="divide-y divide-slate-800/70">
              {cartItems.map((item) => {
                const imgUrl = getProductImage({ id: item.productId, name: item.productName });
                return (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden border border-slate-700/50 flex-shrink-0">
                        <img src={imgUrl} alt={item.productName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100 text-sm line-clamp-1">{item.productName}</p>
                        <p className="text-xs text-slate-400">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="font-bold text-white text-sm">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
                3
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" /> Select Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Credit / Debit Card */}
              <div
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'bg-cyan-950/30 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <CreditCard className="w-6 h-6 text-cyan-400" />
                  {paymentMethod === 'CREDIT_CARD' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <div>
                  <span className="font-bold text-white text-sm block">Credit / Debit Card</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Instant confirmation</span>
                </div>
              </div>

              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'bg-cyan-950/30 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Banknote className="w-6 h-6 text-emerald-400" />
                  {paymentMethod === 'CASH_ON_DELIVERY' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <div>
                  <span className="font-bold text-white text-sm block">Cash on Delivery</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Pay upon package arrival</span>
                </div>
              </div>

              {/* PayPal */}
              <div
                onClick={() => setPaymentMethod('PAYPAL')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'PAYPAL'
                    ? 'bg-cyan-950/30 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <ShieldCheck className="w-6 h-6 text-indigo-400" />
                  {paymentMethod === 'PAYPAL' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <div>
                  <span className="font-bold text-white text-sm block">PayPal Express</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Fast secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Action */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-6">
            <h2 className="text-lg font-bold text-white pb-4 border-b border-slate-800">
              Payment Summary
            </h2>

            {/* Coupon Input */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-2 block">Have a Coupon?</label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-300">{appliedCoupon}</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-rose-400 hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    placeholder="Enter code (e.g. SUMMER10)"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-slate-200 font-medium">${subtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-sm text-cyan-400 font-medium">
                  <span>Coupon Discount</span>
                  <span>Applied at server</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Shipping</span>
                <span className="text-emerald-400 text-xs font-semibold">Free Express Shipping</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 border-t border-slate-800">
              <span className="text-white font-bold text-base">Total Due</span>
              <span className="text-2xl font-black text-white">${subtotal.toFixed(2)}</span>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || !selectedAddressId}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing Order...
                </>
              ) : (
                <>
                  Place Order & Pay <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Encrypted 256-bit SSL Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Address Modal */}
      <AnimatePresence>
        {showAddAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddAddressModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" /> Add Shipping Address
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Full Name *</label>
                  <input
                    type="text"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Phone Number *</label>
                  <input
                    type="text"
                    value={newAddress.phoneNumber}
                    onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                    placeholder="+1 555 123 4567"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Street Address *</label>
                  <input
                    type="text"
                    value={newAddress.addressLine1}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                    placeholder="123 Tech Boulevard"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">City *</label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                      placeholder="San Francisco"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Postal Code *</label>
                    <input
                      type="text"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                      placeholder="94105"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={addAddressMutation.isPending || !newAddress.fullName || !newAddress.addressLine1}
                  onClick={() => addAddressMutation.mutate(newAddress)}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addAddressMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Address'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutPage;
