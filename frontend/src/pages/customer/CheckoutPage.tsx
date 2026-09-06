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
  Tag,
  PackageOpen,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../../api/authApi';
import { orderApi } from '../../api/orderApi';
import { paymentApi } from '../../api/paymentApi';
import { couponApi } from '../../api/couponApi';
import { useCart } from '../../hooks/useCart';
import { useCartStore } from '../../store/useCartStore';
import axios, { type AxiosError } from 'axios';
import { getProductImage } from '../../utils/productImages';
import type { Address, CouponValidateResponse } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cart, isLoading: isCartLoading } = useCart();
  const updateCartCount = useCartStore((state) => state.updateCount);

  // Form State
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'PAYHERE' | 'CREDIT_CARD' | 'CASH_ON_DELIVERY' | 'PAYPAL'>('PAYHERE');
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [validatedCoupon, setValidatedCoupon] = useState<CouponValidateResponse | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
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

  // Derive active address (selected or default/first)
  const activeAddressId = selectedAddressId ?? (addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null);

  // Load PayHere JavaScript SDK dynamically
  const loadPayHereSdk = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.payhere) {
        resolve();
        return;
      }
      const existingScript = document.getElementById('payhere-sdk');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        return;
      }
      const script = document.createElement('script');
      script.id = 'payhere-sdk';
      script.src = 'https://www.payhere.lk/lib/payhere.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load PayHere SDK'));
      document.body.appendChild(script);
    });
  };

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
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message || 'Failed to save address.');
    },
  });

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const discountAmount = validatedCoupon?.valid ? (validatedCoupon.discountAmount ?? 0) : 0;
  const totalDue = Math.max(0, subtotal - discountAmount);

  // Apply Coupon (authoritative server validation preview)
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCodeInput.trim();
    if (!code) return;

    setIsValidatingCoupon(true);
    try {
      const result = await couponApi.validateCoupon(code, subtotal);
      if (result.valid) {
        setValidatedCoupon(result);
        toast.success(result.message || `Coupon "${result.code}" applied!`);
      } else {
        setValidatedCoupon(null);
        toast.error(result.message || 'Invalid coupon code');
      }
    } catch (err) {
      setValidatedCoupon(null);
      const msg = (axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined) || 'Failed to validate coupon';
      toast.error(msg);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setValidatedCoupon(null);
    setCouponCodeInput('');
    toast.info('Coupon removed.');
  };

  // Submit Order & Payment Flow
  const handlePlaceOrder = async () => {
    if (!activeAddressId) {
      toast.error('Please select or add a shipping address.');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setIsPlacingOrder(true);

    try {
      const appliedCode = validatedCoupon?.valid ? validatedCoupon.code : undefined;

      if (paymentMethod === 'PAYHERE') {
        // 1. Create Backend Order
        const order = await orderApi.createOrder({
          addressId: activeAddressId,
          couponCode: appliedCode,
        });

        // 2. Request PayHere Checkout Configuration from Backend
        const payHereParams = await paymentApi.createPayHereCheckout(order.id);

        // 3. Load PayHere JS SDK
        await loadPayHereSdk();

        if (!window.payhere) {
          throw new Error('PayHere payment gateway is currently unavailable.');
        }

        // 4. Setup PayHere callbacks
        window.payhere.onCompleted = () => {
          toast.info('Payment processing. Awaiting backend confirmation...');
          queryClient.invalidateQueries({ queryKey: ['cart'] });
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          updateCartCount(0);
          navigate(`/order-success/${order.id}`);
        };

        window.payhere.onDismissed = () => {
          toast.warning('PayHere payment popup closed.');
          setIsPlacingOrder(false);
          navigate(`/orders/${order.id}`);
        };

        window.payhere.onError = (error: string) => {
          toast.error(`PayHere Payment Error: ${error}`);
          setIsPlacingOrder(false);
        };

        // 5. Start PayHere Popup Checkout
        window.payhere.startPayment({
          sandbox: true,
          merchant_id: payHereParams.merchantId,
          return_url: payHereParams.returnUrl,
          cancel_url: payHereParams.cancelUrl,
          notify_url: payHereParams.notifyUrl,
          order_id: payHereParams.orderId,
          items: payHereParams.items,
          amount: payHereParams.amount,
          currency: payHereParams.currency,
          hash: payHereParams.hash,
          first_name: payHereParams.firstName,
          last_name: payHereParams.lastName,
          email: payHereParams.email,
          phone: payHereParams.phone,
          address: payHereParams.address,
          city: payHereParams.city,
          country: payHereParams.country,
        });
        return;
      }

      // Default COD / Simulated Payment Flow
      const order = await orderApi.createOrder({
        addressId: activeAddressId,
        couponCode: appliedCode,
      });

      await paymentApi.createPayment({
        orderId: order.id,
        amount: order.totalAmount,
        paymentMethod: paymentMethod,
      });

      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      updateCartCount(0);

      toast.success('Order placed successfully!');
      navigate(`/order-success/${order.id}`);
    } catch (error: unknown) {
      const errorMsg =
        (axios.isAxiosError(error) ? (error.response?.data as { message?: string } | undefined)?.message : undefined) ||
        (error instanceof Error ? error.message : 'Failed to place order. Please try again.');
      toast.error(errorMsg);
    } finally {
      if (paymentMethod !== 'PAYHERE') {
        setIsPlacingOrder(false);
      }
    }
  };

  // Loading Skeleton State
  if (isCartLoading || isAddressesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />
            <div className="h-64 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />
          </div>
          <div className="h-80 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />
        </div>
      </div>
    );
  }

  // Empty Cart Guard
  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-6 text-slate-400 dark:text-slate-500">
          <PackageOpen className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your Cart is Empty</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
          You need items in your shopping cart before you can proceed to checkout.
        </p>
        <Link to="/products">
          <Button variant="primary" leftIcon={<ShoppingBag className="w-4 h-4" />}>
            Continue Shopping
          </Button>
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
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors mb-3 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Return to Shopping Cart
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Address & Review & Payment */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Delivery Address */}
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 flex items-center justify-center text-brand-700 dark:text-brand-400 font-bold text-sm">
                  1
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-500 dark:text-brand-400" /> Shipping Address
                </h2>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAddAddressModal(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add New Address
              </Button>
            </div>

            {addresses.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">No saved addresses found. Please add a shipping address to continue.</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddAddressModal(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Address
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = activeAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-50 dark:bg-brand-950/30 border-brand-300 dark:border-brand-500/80 shadow-md shadow-brand-500/10'
                          : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{addr.fullName}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{addr.addressLine1}</p>
                      {addr.addressLine2 && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{addr.addressLine2}</p>}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 flex items-center justify-center text-brand-700 dark:text-brand-400 font-bold text-sm">
                2
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-500 dark:text-brand-400" /> Order Review ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)
              </h2>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800/70">
              {cartItems.map((item) => {
                const imgUrl = getProductImage({ id: item.productId, name: item.productName });
                return (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700/50 flex-shrink-0">
                        <img src={imgUrl} alt={item.productName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">{item.productName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 flex items-center justify-center text-brand-700 dark:text-brand-400 font-bold text-sm">
                3
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-500 dark:text-brand-400" /> Select Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PayHere SANDBOX Payment Gateway */}
              <div
                onClick={() => setPaymentMethod('PAYHERE')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'PAYHERE'
                    ? 'bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-950/50 dark:to-blue-950/40 border-brand-500 shadow-md shadow-brand-500/15'
                    : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30">
                      Sandbox
                    </span>
                  </div>
                  {paymentMethod === 'PAYHERE' && <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">PayHere Payment Gateway</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Cards, EzCash, MSpace, Internet Banking
                  </span>
                </div>
              </div>

              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'bg-brand-50 dark:bg-brand-950/30 border-brand-300 dark:border-brand-500/80 shadow-md shadow-brand-500/10'
                    : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Banknote className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  {paymentMethod === 'CASH_ON_DELIVERY' && <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">Cash on Delivery</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Pay upon package arrival</span>
                </div>
              </div>

              {/* Simulated Credit / Debit Card */}
              <div
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'bg-brand-50 dark:bg-brand-950/30 border-brand-300 dark:border-brand-500/80 shadow-md shadow-brand-500/10'
                    : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <CreditCard className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                  {paymentMethod === 'CREDIT_CARD' && <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">Direct Test Card</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Simulated instant approval</span>
                </div>
              </div>

              {/* PayPal Express */}
              <div
                onClick={() => setPaymentMethod('PAYPAL')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'PAYPAL'
                    ? 'bg-brand-50 dark:bg-brand-950/30 border-brand-300 dark:border-brand-500/80 shadow-md shadow-brand-500/10'
                    : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  {paymentMethod === 'PAYPAL' && <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">PayPal Express</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Simulated PayPal checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Action */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white pb-4 border-b border-slate-200 dark:border-slate-800">
              Payment Summary
            </h2>

            {/* Coupon Input */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block">Have a Coupon?</label>
              {validatedCoupon?.valid ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">{validatedCoupon.code}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        {validatedCoupon.discountType === 'PERCENTAGE'
                          ? `${validatedCoupon.discountValue}% OFF`
                          : `$${validatedCoupon.discountValue} FLAT OFF`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
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
                    disabled={isValidatingCoupon}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 uppercase"
                  />
                  <Button type="submit" variant="secondary" size="sm" isLoading={isValidatingCoupon} disabled={isValidatingCoupon || !couponCodeInput.trim()}>
                    Apply
                  </Button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                <span className="text-slate-700 dark:text-slate-200 font-medium">${subtotal.toFixed(2)}</span>
              </div>

              {validatedCoupon?.valid && discountAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span>Coupon Discount</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-semibold">
                      Preview
                    </span>
                  </span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Shipping</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">Free Express Shipping</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-900 dark:text-white font-bold text-base">Total Due</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">${totalDue.toFixed(2)}</span>
            </div>

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || !activeAddressId}
              variant="primary"
              className="w-full"
              isLoading={isPlacingOrder}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              {paymentMethod === 'PAYHERE' ? 'Pay with PayHere Gateway' : 'Place Order & Pay'}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-brand-500 dark:text-brand-400" />
              <span>Encrypted 256-bit PayHere SSL Checkout</span>
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
              className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-500 dark:text-brand-400" /> Add Shipping Address
              </h3>

              <div className="space-y-3 text-xs">
                <Input
                  label="Full Name *"
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  placeholder="John Doe"
                />

                <Input
                  label="Phone Number *"
                  value={newAddress.phoneNumber}
                  onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                  placeholder="+1 555 123 4567"
                />

                <Input
                  label="Street Address *"
                  value={newAddress.addressLine1}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                  placeholder="123 Tech Boulevard"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="City *"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    placeholder="San Francisco"
                  />
                  <Input
                    label="Postal Code *"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    placeholder="94105"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowAddAddressModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={addAddressMutation.isPending || !newAddress.fullName || !newAddress.addressLine1}
                  onClick={() => addAddressMutation.mutate(newAddress)}
                  isLoading={addAddressMutation.isPending}
                >
                  Save Address
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutPage;
