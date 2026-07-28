import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Truck, CheckCircle, MapPin, CreditCard, ChevronLeft, UserCircle2, Banknote, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getTotal, getSubtotal, getDiscount, appliedCoupon, clearCart } = useCartStore();
  const { token, user } = useAuthStore();
  const { showToast } = useToastStore();
  
  const [step, setStep] = useState(token ? 2 : 1); // 1: Auth, 2: Address, 3: Payment
  const [address, setAddress] = useState({
    name: user?.name || '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
    mobile: user?.phone || ''
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  const overlayRef = useRef(null);
  const iconRef = useRef(null);
  const textRef = useRef(null);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  
  const [shippingConfig, setShippingConfig] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const finalTotal = subtotal - discount + shippingFee;

  useEffect(() => {
    fetch(`${BACKEND_URL}/general/shipping`)
      .then(r => r.json())
      .then(d => setShippingConfig(d))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!shippingConfig) return;
    
    let fee = 0;
    const amount = subtotal; 

    if (shippingConfig.settings.mode === 'fixed') {
      // Flat percentage applied immediately
      fee = amount * (shippingConfig.settings.fixed_percentage / 100);
    } else if (shippingConfig.settings.mode === 'pincode') {
      // ZIP Code based: Initially 0. Calculate only if 6 digits are entered.
      if (address.pincode.length === 6) {
        const currentZipCode = address.pincode.trim();
        const match = shippingConfig.zipCodes.find(p => p.pincode === currentZipCode);
        if (match) {
          fee = amount * (match.percentage / 100);
        } else {
          // If no matching rule for this pincode, fee remains 0
          fee = 0;
        }
      } else {
        // Not 6 digits yet, fee is 0
        fee = 0;
      }
    }
    setShippingFee(Math.round(fee));
  }, [shippingConfig, address.pincode, subtotal]);

  const couponCode = appliedCoupon?.code || location.state?.couponCode || '';

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0 && !isPlacingOrder) {
      navigate('/cart');
    }
  }, [items, navigate, isPlacingOrder]);

  // If user logs in mid-way
  useEffect(() => {
    if (token && step === 1) {
      setStep(2);
      if (user) {
        setAddress(prev => ({ ...prev, name: user.name, mobile: user.phone }));
      }
    }
  }, [token, step, user]);

  useGSAP(() => {
    if (isPlacingOrder) {
      const tl = gsap.timeline();
      
      tl.from(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' })
        .from(iconRef.current, { scale: 0, rotation: -180, duration: 0.6, ease: 'back.out(1.7)' })
        .from(textRef.current, { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' }, "-=0.2")
        .to(iconRef.current, { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut', delay: 0.2 });
    }
  }, { dependencies: [isPlacingOrder] });

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const COD_ADVANCE = 100;
  const codRemaining = finalTotal - COD_ADVANCE;

  const createOrder = async (pMethod) => {
    const endpoint = token ? `${BACKEND_URL}/auth/orders` : `${BACKEND_URL}/general/orders`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        items,
        address,
        total: finalTotal,
        coupon_code: couponCode,
        payment_method: pMethod,
      })
    });
    return res.json();
  };

  const handleProceedToPayment = () => {
    if (!address.name.trim() || !address.line1.trim() || !address.city.trim() || !address.state.trim() || !address.pincode.trim() || !address.mobile.trim()) {
      showToast('Please fill all details. All fields are required.', 'error');
      return;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      showToast('ZIP Code must be 6 digits.', 'error');
      return;
    }
    if (!/^\d{10}$/.test(address.mobile)) {
      showToast('Phone number must be exactly 10 digits.', 'error');
      return;
    }
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const res = await loadRazorpay();
      if (!res) {
        showToast('Razorpay SDK failed to load. Are you online?', 'error');
        setIsPlacingOrder(false);
        return;
      }

      // Amount to charge online: $100 for COD, full amount for prepaid
      const chargeAmount = paymentMethod === 'cod' ? COD_ADVANCE : finalTotal;

      // Create Razorpay Order
      const orderRes = await fetch(`${BACKEND_URL}/general/razorpay/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: chargeAmount })
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        showToast('Failed to initialize payment', 'error');
        setIsPlacingOrder(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Tradition Store',
        description: paymentMethod === 'cod'
          ? `COD Advance Payment ($${COD_ADVANCE})`
          : 'Order Payment',
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyRes = await fetch(`${BACKEND_URL}/general/razorpay/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              const createOrderData = await createOrder(paymentMethod);
              if (createOrderData.success) {
                setTimeout(() => {
                  clearCart();
                  navigate(`/order-tracking/${createOrderData.order.order_number}`);
                }, 2000);
              } else {
                showToast('Failed to place order after payment.', 'error');
                setIsPlacingOrder(false);
              }
            } else {
              showToast('Payment verification failed', 'error');
              setIsPlacingOrder(false);
            }
          } catch (err) {
            console.error(err);
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: address.name,
          contact: address.mobile
        },
        theme: { color: '#08183A' },
        modal: {
          ondismiss: function () {
            setIsPlacingOrder(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      setIsPlacingOrder(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between items-center mb-6 px-2 bg-white/80 p-3 rounded-xl shadow-sm border border-brand-gold/20">
      <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/cart')}>
        <div className="w-6 h-6 rounded-full bg-brand-dark-blue text-brand-gold flex items-center justify-center text-xs font-bold border border-brand-gold/30">✓</div>
        <span className="text-[10px] text-brand-dark-blue font-bold mt-1">Cart</span>
      </div>
      <div className={`h-px flex-1 mx-2 ${step >= 2 ? 'bg-brand-gold/40' : 'bg-brand-gold/20'}`}></div>
      
      <div className="flex flex-col items-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-brand-dark-blue text-brand-gold border border-brand-gold/30' : 'bg-brand-beige-darker text-brand-dark-blue/50 border border-brand-dark-blue/10'}`}>
          {step > 2 ? '✓' : (token ? '✓' : '1')}
        </div>
        <span className={`text-[10px] font-bold mt-1 ${step >= 2 ? 'text-brand-dark-blue' : 'text-brand-dark-blue/50'}`}>{token ? 'Auth' : 'Login'}</span>
      </div>
      <div className={`h-px flex-1 mx-2 ${step >= 2 ? 'bg-brand-gold/40' : 'bg-brand-gold/20'}`}></div>

      <div className="flex flex-col items-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-brand-dark-blue text-brand-gold border border-brand-gold/30' : 'bg-brand-beige-darker text-brand-dark-blue/50 border border-brand-dark-blue/10'}`}>
          {step > 2 ? '✓' : '2'}
        </div>
        <span className={`text-[10px] font-bold mt-1 ${step >= 2 ? 'text-brand-dark-blue' : 'text-brand-dark-blue/50'}`}>Address</span>
      </div>
      <div className={`h-px flex-1 mx-2 ${step >= 3 ? 'bg-brand-gold/40' : 'bg-brand-gold/20'}`}></div>
      <div className={`flex flex-col items-center ${step < 3 ? 'opacity-70' : ''}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-brand-dark-blue text-brand-gold border border-brand-gold/30' : 'bg-brand-beige-darker text-brand-dark-blue/50 border border-brand-dark-blue/10'}`}>3</div>
        <span className={`text-[10px] font-bold mt-1 ${step >= 3 ? 'text-brand-dark-blue' : 'text-brand-dark-blue/50'}`}>Payment</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-beige pb-36 font-sans">
      <Header title="Checkout" />
      
      <div className="p-4 md:p-8 space-y-4 md:space-y-8 md:max-w-7xl mx-auto">
        {renderStepIndicator()}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 items-start">
          {/* Left Column: Forms */}
          <div className="lg:col-span-8 space-y-6">
            {step === 1 && (
              <div className="space-y-4 max-w-3xl mx-auto">
                <h2 className="text-xl font-bold text-brand-dark-blue flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center">
                    <UserCircle2 className="w-4 h-4 text-brand-gold" />
                  </div>
                  Authentication
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Login Option */}
                  <div className="bg-white/80 p-6 rounded-2xl shadow-sm border border-brand-gold/20 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-brand-dark-blue mb-2">Login / Sign Up</h3>
                      <p className="text-sm text-brand-dark-blue/60 mb-6">Access your saved addresses, track orders easily, and get exclusive offers.</p>
                    </div>
                    <button 
                      onClick={() => navigate('/login?redirect=/checkout')}
                      className="w-full bg-brand-dark-blue text-brand-gold font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Login to Continue
                    </button>
                  </div>
                  
                  {/* Guest Checkout Option */}
                  <div className="bg-white/80 p-6 rounded-2xl shadow-sm border border-brand-gold/20 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-brand-dark-blue mb-2">Guest Checkout</h3>
                      <p className="text-sm text-brand-dark-blue/60 mb-6">Proceed without an account. You can track your order using the order ID.</p>
                    </div>
                    <button 
                      onClick={() => setStep(2)}
                      className="w-full bg-brand-beige-darker text-brand-dark-blue border border-brand-dark-blue/10 font-bold py-3 rounded-xl hover:bg-brand-beige transition-colors"
                    >
                      Checkout as Guest
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-brand-dark-blue flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-brand-gold" />
              </div>
              Shipping Address
            </h2>
            
            <div className="bg-white/80 p-6 rounded-2xl shadow-sm border border-brand-gold/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-gold/5 to-transparent rounded-bl-full pointer-events-none"></div>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                  <input required value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full text-lg font-bold text-gray-900 border-b-2 border-gray-100 py-1 focus:outline-none focus:border-brand-gold transition-colors bg-transparent" placeholder="Full Name" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Address Line 1</label>
                  <input required value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})} className="w-full text-base text-gray-700 border-b border-gray-200 py-1 focus:outline-none focus:border-brand-gold transition-colors bg-transparent" placeholder="Address Line 1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">City</label>
                    <input required value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full text-base text-gray-700 border-b border-gray-200 py-1 focus:outline-none focus:border-brand-gold transition-colors bg-transparent" placeholder="City" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">State</label>
                    <input required value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full text-base text-gray-700 border-b border-gray-200 py-1 focus:outline-none focus:border-brand-gold transition-colors bg-transparent" placeholder="State" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">ZIP Code</label>
                    <input type="text" maxLength={6} required value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value.replace(/\D/g, '')})} className="w-full text-base text-gray-700 border-b border-gray-200 py-1 focus:outline-none focus:border-brand-gold transition-colors bg-transparent" placeholder="ZIP Code" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Mobile</label>
                    <input type="text" maxLength={10} required value={address.mobile} onChange={e => setAddress({...address, mobile: e.target.value.replace(/\D/g, '')})} className="w-full text-base text-gray-700 border-b border-gray-200 py-1 focus:outline-none focus:border-brand-gold transition-colors bg-transparent" placeholder="Mobile Number" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-brand-gold" />
              </div>
              Payment Method
            </h2>

            <div className="bg-white/80 p-5 rounded-2xl shadow-sm border border-brand-gold/20">
              <div className="space-y-3">
                {/* Online Payment */}
                <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-brand-gold bg-gray-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}`}>
                  <div className="w-9 h-9 rounded-lg bg-brand-gold/10 flex items-center justify-center mr-3 shrink-0">
                    <CreditCard className="w-5 h-5 text-brand-dark-blue" />
                  </div>
                  <div className="flex-1" onClick={() => setPaymentMethod('razorpay')}>
                    <span className="text-base font-bold text-brand-dark-blue block">Online Payment</span>
                    <span className="text-xs text-brand-dark-blue/60">Credit/Debit Card, UPI, NetBanking</span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="w-4 h-4 accent-brand-gold"
                  />
                </label>

                {/* COD */}
                <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}`}>
                  <div className="w-9 h-9 rounded-lg bg-brand-gold/10 flex items-center justify-center mr-3 shrink-0">
                    <Banknote className="w-5 h-5 text-brand-dark-blue" />
                  </div>
                  <div className="flex-1" onClick={() => setPaymentMethod('cod')}>
                    <span className="text-base font-bold text-brand-dark-blue block">Cash on Delivery</span>
                    <span className="text-xs text-brand-dark-blue/60">Pay $100 now + ${Math.max(0, codRemaining).toFixed(0)} at your door</span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 accent-emerald-500"
                  />
                </label>
              </div>
            </div>

            {/* COD Info Banner */}
            {paymentMethod === 'cod' && (
              <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-emerald-800">How COD works</p>
                  <ul className="mt-1 space-y-1">
                    <li className="text-xs text-emerald-700">✓ Pay <strong>${COD_ADVANCE}</strong> advance online now (via Razorpay)</li>
                    <li className="text-xs text-emerald-700">✓ Remaining <strong>${Math.max(0, codRemaining).toFixed(0)}</strong> is collected at your door by the delivery person</li>
                    <li className="text-xs text-emerald-700">✓ Your order will be confirmed instantly after the $100 advance</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>          {/* Right Column: Order Summary (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-brand-gold/20">
              <h3 className="font-serif font-bold text-brand-dark-blue mb-6 text-xl">Order Summary</h3>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto hide-scrollbar pr-2 mb-6">
                {items.map(item => (
                  <div key={`${item.product.id}-${item.variant?.size}`} className="flex gap-4">
                    <div className="w-16 h-16 bg-white rounded-xl border border-brand-gold/10 p-1 shrink-0">
                      <img src={item.product.images?.[0] || item.product.image_url} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-brand-dark-blue line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-brand-dark-blue/60 mt-1">Qty: {item.qty} | {item.variant?.size || 'Std'}</p>
                      <p className="text-sm font-bold text-brand-gold mt-1">${(item.variant?.price || item.product.price) * item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-brand-gold/20 pt-4 mb-6">
                <div className="flex justify-between text-sm text-brand-dark-blue/80 mb-2">
                  <span>Item Total</span>
                  <span className="font-medium text-brand-dark-blue">${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-brand-gold mb-2">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span className="font-medium">- ${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-brand-dark-blue/80 mb-2">
                  <span>Shipping Fee</span>
                  <span className="font-medium text-brand-dark-blue">${shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-brand-dark-blue text-xl pt-2 border-t border-brand-gold/20">
                  <span>Grand Total</span>
                  <span className="text-brand-gold">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {step === 1 ? (
                <button 
                  disabled
                  className="w-full bg-brand-beige-darker text-brand-dark-blue/50 font-bold text-base rounded-xl py-4 flex items-center justify-center cursor-not-allowed"
                >
                  Select Checkout Method
                </button>
              ) : step === 2 ? (
                <button 
                  onClick={handleProceedToPayment}
                  className="w-full bg-brand-dark-blue text-brand-gold font-bold text-base rounded-xl py-4 shadow-lg shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Payment
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className={`w-full font-bold text-base rounded-xl py-4 flex items-center justify-center gap-2 transition-all ${
                    isPlacingOrder ? 'opacity-70 cursor-not-allowed bg-brand-beige-darker text-brand-dark-blue/50' :
                    paymentMethod === 'cod'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5'
                      : 'bg-brand-dark-blue text-brand-gold shadow-lg shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                >
                  {isPlacingOrder ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Placing Order...
                    </div>
                  ) : paymentMethod === 'cod' ? (
                    <>
                      <Banknote className="w-5 h-5" />
                      Pay ${COD_ADVANCE} Advance & Place Order
                    </>
                  ) : 'Confirm & Pay'}
                </button>
              )}
              
              <div className="flex items-center justify-center gap-2 mt-4 text-gray-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-medium">100% Secure Transaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-brand-beige/95 backdrop-blur-md border-t border-brand-gold/20 p-4 pb-safe z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] mx-auto w-full">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-4">
            <div>
              {step === 3 && paymentMethod === 'cod' ? (
                <>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pay Now (Advance)</p>
                  <p className="text-2xl font-bold text-emerald-600 leading-none">${COD_ADVANCE}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">+ ${Math.max(0, codRemaining).toFixed(0)} at delivery</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold text-brand-dark-blue/60 uppercase tracking-wider mb-1">Payable Amount</p>
                  <div className="flex flex-col">
                    {appliedCoupon && <span className="text-[10px] text-brand-gold font-bold -mb-1">Code applied: {appliedCoupon.code}</span>}
                    <p className="text-2xl font-bold text-brand-dark-blue leading-none">${finalTotal.toFixed(2)}</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {step === 1 ? (
            <button 
              disabled
              className="w-full bg-gray-100 text-gray-400 font-bold text-base rounded-xl py-4 flex items-center justify-center cursor-not-allowed"
            >
              Select Checkout Method
            </button>
          ) : step === 2 ? (
            <button 
              onClick={handleProceedToPayment}
              className="w-full bg-brand-dark-blue text-brand-gold font-bold text-base rounded-xl py-4 shadow-lg shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Payment
              <span className="w-1 h-1 bg-white rounded-full mx-1 opacity-50" />
              Step 3
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className={`w-full font-bold text-base rounded-xl py-4 shadow-lg flex items-center justify-center gap-2 transition-all ${
                isPlacingOrder ? 'opacity-70 cursor-not-allowed bg-brand-beige-darker text-brand-dark-blue/50 shadow-none' :
                paymentMethod === 'cod'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5'
                  : 'bg-brand-dark-blue text-brand-gold shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              {isPlacingOrder ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Placing Order...
                </div>
              ) : paymentMethod === 'cod' ? (
                <>
                  <Banknote className="w-5 h-5" />
                  Pay ${COD_ADVANCE} Advance & Place Order
                </>
              ) : 'Confirm Order'}
            </button>
          )}
        
        <div className="flex items-center justify-center gap-1 mt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[9px] text-gray-400 font-medium">Your order is safe and secure</span>
        </div>
        </div>
      </div>

      {/* Order Placed Success Overlay */}
      {isPlacingOrder && (
        <div ref={overlayRef} className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col items-center gap-4">
            <div ref={iconRef} className="w-24 h-24 bg-[#08183A] rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
            <h2 ref={textRef} className="text-2xl font-serif font-bold text-[#08183A]">Order Confirmed!</h2>
            <p className="text-sm text-gray-500">Redirecting to tracking...</p>
          </div>
        </div>
      )}
    </div>
  );
}
