import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';
import {
  MapPin,
  Banknote,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useCart } from '../../hooks/useCart';
import { getProductImage } from '../../utils/productImages';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const GuestCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, isLoading: isCartLoading, clearCart } = useCart();

  // Form State
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'United States',
  });
  
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((acc, item) => acc + item.quantity * Number(item.price), 0);

  const handlePlaceOrder = async () => {
    if (!email || !address.fullName || !address.phoneNumber || !address.addressLine1 || !address.city || !address.postalCode) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setIsPlacingOrder(true);

    try {
      const payload = {
        guestEmail: email,
        deliveryAddress: address,
        couponCode: couponCodeInput || undefined,
        items: cartItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity
        }))
      };

      const response = await axios.post('/api/v1/orders/guest-checkout', payload);
      const order = response.data;

      await clearCart();

      toast.success('Order placed successfully!');
      navigate(`/guest-order-success/${order.id}?token=${order.guestToken}`);
    } catch (error: unknown) {
      const errorMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Checkout failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isCartLoading) {
    return <div className="p-20 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Guest Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <MapPin className="text-brand-500 w-5 h-5" /> Delivery Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input label="Email Address *" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <Input label="Full Name *" value={address.fullName} onChange={e => setAddress({ ...address, fullName: e.target.value })} required />
              <Input label="Phone Number *" type="tel" value={address.phoneNumber} onChange={e => setAddress({ ...address, phoneNumber: e.target.value })} required />
              <div className="md:col-span-2">
                <Input label="Address Line 1 *" value={address.addressLine1} onChange={e => setAddress({ ...address, addressLine1: e.target.value })} required />
              </div>
              <div className="md:col-span-2">
                <Input label="Address Line 2 (Optional)" value={address.addressLine2} onChange={e => setAddress({ ...address, addressLine2: e.target.value })} />
              </div>
              <Input label="City *" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} required />
              <Input label="Postal Code *" value={address.postalCode} onChange={e => setAddress({ ...address, postalCode: e.target.value })} required />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Banknote className="text-brand-500 w-5 h-5" /> Payment
            </h2>
            <p className="text-slate-600 dark:text-slate-400">Cash on Delivery (COD) is selected for guest checkout.</p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="sticky top-24 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-slate-100 flex-shrink-0">
                    <img src={getProductImage({ id: item.productId, name: item.productName })} alt="" className="w-full h-full object-cover rounded" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.productName}</p>
                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3 mb-6">
              <Input label="Coupon Code" value={couponCodeInput} onChange={e => setCouponCodeInput(e.target.value)} />
            </div>
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
            <Button variant="primary" size="lg" className="w-full" onClick={handlePlaceOrder} isLoading={isPlacingOrder} disabled={isPlacingOrder || cartItems.length === 0} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Place Order
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
