import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Store, CheckCircle, CreditCard, ChevronLeft, UserCircle2 } from 'lucide-react';
import { Header } from '../components/Header';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function PickupPage() {
  const navigate = useNavigate();
  const { items, getTotal, getSubtotal, getDiscount, appliedCoupon, clearCart } = useCartStore();
  const { token, user } = useAuthStore();
  const { showToast } = useToastStore();
  
  const [step, setStep] = useState(token ? 2 : 1); // 1: Auth, 2: Details, 3: Payment
  const [details, setDetails] = useState({
    name: user?.name || '',
    mobile: user?.phone || ''
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  const overlayRef = useRef(null);
  const iconRef = useRef(null);
  const textRef = useRef(null);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  
  const [taxConfig, setTaxConfig] = useState(null);
  const [taxAmount, setTaxAmount] = useState(0);
  const finalTotal = subtotal - discount + taxAmount;

  useEffect(() => {
    fetch(`${BACKEND_URL}/general/shipping`)
      .then(r => r.json())
      .then(d => setTaxConfig(d))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!taxConfig || !taxConfig.settings) return;
    
    // Tax on subtotal after discount
    const taxable = subtotal - discount;
    const tax = taxable * ((taxConfig.settings.tax_percentage ?? 0) / 100);
    setTaxAmount(tax);
  }, [taxConfig, subtotal, discount]);

  const couponCode = appliedCoupon?.code || '';

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
        setDetails(prev => ({ ...prev, name: user.name, mobile: user.phone }));
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

  const createOrder = async (pMethod) => {
    const endpoint = token ? `${BACKEND_URL}/auth/orders` : `${BACKEND_URL}/general/orders`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        items,
        address: { name: details.name, mobile: details.mobile }, // Save name/mobile in address field for pickup
        total: finalTotal,
        coupon_code: couponCode,
        payment_method: pMethod,
        order_type: 'pickup'
      })
    });
    return res.json();
  };

  const handleProceedToPayment = () => {
    if (!details.name.trim() || !details.mobile.trim()) {
      showToast('Please provide name and mobile number.', 'error');
      return;
    }
    if (!/^\d{10}$/.test(details.mobile)) {
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

      const chargeAmount = finalTotal;

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
        description: 'Store Pickup Order Payment',
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
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
              const createOrderData = await createOrder('razorpay');
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
          name: details.name,
          contact: details.mobile
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
      <div className="h-px bg-brand-dark-blue flex-1 mx-2"></div>
      
      <div className="flex flex-col items-center cursor-pointer" onClick={() => step > 1 && setStep(1)}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${step >= 1 ? 'bg-brand-dark-blue text-brand-gold border-brand-gold/30' : 'bg-brand-beige-darker text-brand-dark-blue/60 border-brand-dark-blue/10'}`}>
          {step > 1 ? '✓' : '1'}
        </div>
        <span className={`text-[10px] font-bold mt-1 ${step >= 1 ? 'text-brand-dark-blue' : 'text-brand-dark-blue/60'}`}>Login</span>
      </div>
      <div className={`h-px flex-1 mx-2 ${step > 1 ? 'bg-brand-dark-blue' : 'bg-brand-gold/30'}`}></div>

      <div className="flex flex-col items-center cursor-pointer" onClick={() => step > 2 && setStep(2)}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${step >= 2 ? 'bg-brand-dark-blue text-brand-gold border-brand-gold/30' : 'bg-brand-beige-darker text-brand-dark-blue/60 border-brand-dark-blue/10'}`}>
          {step > 2 ? '✓' : '2'}
        </div>
        <span className={`text-[10px] font-bold mt-1 ${step >= 2 ? 'text-brand-dark-blue' : 'text-brand-dark-blue/60'}`}>Details</span>
      </div>
      <div className={`h-px flex-1 mx-2 ${step > 2 ? 'bg-brand-dark-blue' : 'bg-brand-gold/30'}`}></div>

      <div className="flex flex-col items-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${step >= 3 ? 'bg-brand-dark-blue text-brand-gold border-brand-gold/30' : 'bg-brand-beige-darker text-brand-dark-blue/60 border-brand-dark-blue/10'}`}>
          3
        </div>
        <span className={`text-[10px] font-bold mt-1 ${step >= 3 ? 'text-brand-dark-blue' : 'text-brand-dark-blue/60'}`}>Payment</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-beige pb-36">
      <Header title="Store Pickup Checkout" />
      
      <div className="p-4 md:p-8 md:max-w-7xl mx-auto mt-6">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/cart')} 
          className="flex items-center text-sm font-bold text-brand-dark-blue hover:text-brand-gold transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          {step === 1 ? 'Back to Cart' : 'Back'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Steps */}
          <div className="lg:col-span-8">
            {renderStepIndicator()}

            {step === 1 && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <h2 className="text-xl font-bold text-brand-dark-blue flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center">
                    <UserCircle2 className="w-4 h-4 text-brand-gold" />
                  </div>
                  Account Details
                </h2>
                <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-brand-gold/20 flex flex-col items-center justify-center text-center">
                  <UserCircle2 className="w-16 h-16 text-brand-gold mb-4" />
                  <h3 className="text-lg font-bold text-brand-dark-blue mb-2">Welcome to Secure Checkout</h3>
                  <p className="text-sm text-brand-dark-blue/60 mb-8 max-w-sm">Log in to your account for a faster checkout experience and to earn loyalty points on this purchase.</p>
                  
                  <div className="w-full max-w-sm space-y-3 flex flex-col items-center">
                    <button 
                      onClick={() => navigate('/login', { state: { returnTo: '/pickup' } })}
                      className="w-full bg-brand-dark-blue text-brand-gold font-bold py-3 rounded-xl shadow-lg shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      Login to your account
                    </button>
                    <div className="flex items-center w-full gap-3 py-2">
                      <div className="h-px bg-brand-gold/20 flex-1"></div>
                      <span className="text-xs font-bold text-brand-dark-blue/40 uppercase">or</span>
                      <div className="h-px bg-brand-gold/20 flex-1"></div>
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
                    <Store className="w-4 h-4 text-brand-gold" />
                  </div>
                  Pickup Details
                </h2>
                
                <div className="bg-white/80 p-6 rounded-2xl shadow-sm border border-brand-gold/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-gold/5 to-transparent rounded-bl-full pointer-events-none"></div>
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                      <input required value={details.name} onChange={e => setDetails({...details, name: e.target.value})} className="w-full text-lg font-bold text-gray-900 border-b-2 border-gray-100 py-1 focus:outline-none focus:border-brand-gold transition-colors bg-transparent" placeholder="Full Name for Pickup" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Mobile</label>
                      <input type="text" maxLength={10} required value={details.mobile} onChange={e => setDetails({...details, mobile: e.target.value.replace(/\D/g, '')})} className="w-full text-base text-gray-700 border-b border-gray-200 py-1 focus:outline-none focus:border-brand-gold transition-colors bg-transparent" placeholder="Mobile Number" />
                    </div>
                    <div className="mt-4 p-4 bg-brand-dark-blue/5 border border-brand-dark-blue/10 rounded-xl">
                      <p className="text-sm text-brand-dark-blue font-bold flex items-center gap-2"><Store className="w-4 h-4 text-brand-gold"/> Pickup Location</p>
                      <p className="text-xs text-brand-dark-blue/80 mt-1">Houra Jewels Store, Main Market, City Center</p>
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
                    <label className="flex items-center p-4 rounded-xl border-2 border-brand-gold bg-gray-50/50 shadow-sm cursor-pointer transition-all">
                      <div className="w-9 h-9 rounded-lg bg-brand-gold/10 flex items-center justify-center mr-3 shrink-0">
                        <CreditCard className="w-5 h-5 text-brand-dark-blue" />
                      </div>
                      <div className="flex-1">
                        <span className="text-base font-bold text-brand-dark-blue block">Online Payment</span>
                        <span className="text-xs text-brand-dark-blue/60">Credit/Debit Card, UPI, NetBanking</span>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={true}
                        readOnly
                        className="w-4 h-4 accent-brand-gold"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary (Desktop) */}
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
                {taxAmount > 0 && (
                  <div className="flex justify-between text-sm text-brand-dark-blue/80 mb-2">
                    <span>Tax ({taxConfig?.settings?.tax_percentage ?? 0}%)</span>
                    <span className="font-medium text-brand-dark-blue">${taxAmount.toFixed(2)}</span>
                  </div>
                )}
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
                    isPlacingOrder ? 'opacity-70 cursor-not-allowed bg-brand-beige-darker text-brand-dark-blue/50' : 'bg-brand-dark-blue text-brand-gold shadow-lg shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                >
                  {isPlacingOrder ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Placing Order...
                    </div>
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
              <p className="text-xs font-bold text-brand-dark-blue/60 uppercase tracking-wider mb-1">Payable Amount</p>
              <div className="flex flex-col">
                {appliedCoupon && <span className="text-[10px] text-brand-gold font-bold -mb-1">Code applied: {appliedCoupon.code}</span>}
                <p className="text-2xl font-bold text-brand-dark-blue leading-none">${finalTotal.toFixed(2)}</p>
              </div>
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
                isPlacingOrder ? 'opacity-70 cursor-not-allowed bg-brand-beige-darker text-brand-dark-blue/50 shadow-none' : 'bg-brand-dark-blue text-brand-gold shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              {isPlacingOrder ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Placing Order...
                </div>
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
