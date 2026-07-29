import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Truck, CheckCircle, MapPin, CreditCard, ChevronLeft, UserCircle2, ShoppingCart } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { PhoneInput, formatPhone, parsePhone } from '../components/PhoneInput';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Header } from '../components/Header';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahrain','Bangladesh','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana',
  'Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Chad','Chile','China',
  'Colombia','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominican Republic',
  'Ecuador','Egypt','El Salvador','Estonia','Ethiopia','Finland','France','Gabon','Georgia','Germany','Ghana',
  'Greece','Guatemala','Guinea','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland',
  'Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon',
  'Libya','Lithuania','Luxembourg','Madagascar','Malaysia','Maldives','Mali','Malta','Mexico','Moldova','Mongolia',
  'Morocco','Mozambique','Myanmar','Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria',
  'North Korea','Norway','Oman','Pakistan','Palestine','Panama','Paraguay','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Russia','Rwanda','Saudi Arabia','Senegal','Serbia','Singapore','Slovakia','Slovenia',
  'Somalia','South Africa','South Korea','Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan',
  'Tajikistan','Tanzania','Thailand','Tunisia','Turkey','Turkmenistan','Uganda','Ukraine','United Arab Emirates',
  'United Kingdom','United States','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe'
];

function StripeCardForm({ onReady }) {
  const elements = useElements();
  useEffect(() => {
    if (elements) onReady(elements.getElement(CardElement));
  }, [elements]);
  return (
    <div className="p-3 border border-brand-gold/30 rounded-xl bg-white">
      <CardElement options={{
        style: {
          base: { fontSize: '16px', color: '#08183A', '::placeholder': { color: '#9ca3af' } },
          invalid: { color: '#ef4444' }
        }
      }} />
    </div>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getTotal, getSubtotal, getDiscount, appliedCoupon, clearCart } = useCartStore();
  const { token, user } = useAuthStore();
  const { showToast } = useToastStore();
  
  const [step, setStep] = useState(token ? 2 : 1);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    mobile: user?.phone || ''
  });
  const [countrySearch, setCountrySearch] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (countryRef.current && !countryRef.current.contains(e.target)) setCountryOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [stripeCardElement, setStripeCardElement] = useState(null);
  
  const overlayRef = useRef(null);
  const iconRef = useRef(null);
  const textRef = useRef(null);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  
  const [shippingConfig, setShippingConfig] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [taxLabel, setTaxLabel] = useState('Tax (enter pincode)');
  const finalTotal = subtotal - discount + shippingFee + taxAmount;

  useEffect(() => {
    fetch(`${BACKEND_URL}/general/shipping`)
      .then(r => r.json())
      .then(d => setShippingConfig(d))
      .catch(console.error);
  }, []);

  // Recompute shipping fee whenever config loads
  useEffect(() => {
    if (!shippingConfig?.settings) return;
    const threshold = parseFloat(shippingConfig.settings.free_shipping_threshold) || 0;
    const flat = parseFloat(shippingConfig.settings.flat_rate) || 0;
    setShippingFee(threshold > 0 && (subtotal - discount) >= threshold ? 0 : flat);
  }, [shippingConfig, subtotal, discount]);

  // Recompute tax whenever subtotal, discount, address pincode, or config changes
  useEffect(() => {
    if (!shippingConfig?.settings) return;
    const { tax_mode, tax_percentage } = shippingConfig.settings;
    const taxable = subtotal - discount;

    if (tax_mode === 'pincode') {
      const pin = address.pincode?.trim();
      const rule = pin ? (shippingConfig.pincodes || []).find(p => p.pincode === pin) : null;
      const pct = rule ? parseFloat(rule.percentage) : 0;
      setTaxAmount(taxable * (pct / 100));
      setTaxLabel(rule ? `Tax (${pct}% — pincode ${pin})` : 'Tax (0% — pincode not matched)');
    } else {
      const pct = parseFloat(tax_percentage) || 0;
      setTaxAmount(taxable * (pct / 100));
      setTaxLabel(`Tax (${pct}%)`);
    }
  }, [shippingConfig, subtotal, discount, address.pincode]);

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

  const createOrder = async (pMethod, stripePaymentIntentId = null) => {
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
        stripe_payment_intent_id: stripePaymentIntentId,
      })
    });
    return res.json();
  };

  const handleProceedToPayment = () => {
    if (!address.name.trim() || !address.line1.trim() || !address.city.trim() || !address.state.trim() || !address.pincode.trim() || !address.mobile.trim() || !address.country.trim()) {
      showToast('Please fill all details. All fields are required.', 'error');
      return;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      showToast('ZIP Code must be 6 digits.', 'error');
      return;
    }
    if (!/^\+\d{7,15}$/.test(address.mobile)) {
      showToast('Please enter a valid phone number.', 'error');
      return;
    }
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      // 1. Create PaymentIntent on backend
      const intentRes = await fetch(`${BACKEND_URL}/general/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal })
      });
      const intentData = await intentRes.json();
      if (!intentData.success) {
        showToast('Failed to initialize payment', 'error');
        setIsPlacingOrder(false);
        return;
      }

      // 2. Confirm payment with Stripe
      const stripe = await stripePromise;
      const { error, paymentIntent } = await stripe.confirmCardPayment(intentData.clientSecret, {
        payment_method: {
          card: stripeCardElement,
          billing_details: { name: address.name }
        }
      });

      if (error) {
        showToast(error.message || 'Payment failed', 'error');
        setIsPlacingOrder(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        const createOrderData = await createOrder('stripe', paymentIntent.id);
        if (createOrderData.success) {
          setTimeout(() => {
            clearCart();
            navigate(`/order-tracking/${createOrderData.order.order_number}`);
          }, 2000);
        } else {
          showToast('Failed to place order after payment.', 'error');
          setIsPlacingOrder(false);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Payment error. Please try again.', 'error');
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

        {/* Mobile Order Summary (collapsible) */}
        <div className="lg:hidden">
          <button
            onClick={() => setSummaryOpen(o => !o)}
            className="w-full flex items-center justify-between bg-white/90 border border-brand-gold/20 rounded-2xl px-4 py-3.5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-brand-gold" />
              <span className="text-sm font-bold text-brand-dark-blue">Order Summary</span>
              <span className="text-xs bg-brand-gold/10 text-brand-gold font-bold px-2 py-0.5 rounded-full">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-brand-gold">${finalTotal.toFixed(2)}</span>
              <svg className={`w-4 h-4 text-brand-dark-blue/50 transition-transform ${summaryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </button>

          {summaryOpen && (
            <div className="mt-2 bg-white/90 border border-brand-gold/20 rounded-2xl p-4 shadow-sm space-y-4">
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={`${item.product.id}-${item.variant?.size}`} className="flex gap-3">
                    <div className="w-14 h-14 bg-white rounded-xl border border-brand-gold/10 p-1 shrink-0">
                      <img src={item.product.images?.[0] || item.product.image_url} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-brand-dark-blue line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-brand-dark-blue/60">Qty: {item.qty} | {item.variant?.size || 'Standard'}</p>
                      <p className="text-sm font-bold text-brand-gold">${(item.variant?.price || item.product.price) * item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-brand-gold/20 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm text-brand-dark-blue/70">
                  <span>Item Total</span><span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-brand-gold">
                    <span>Coupon ({appliedCoupon.code})</span><span>- ${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-brand-dark-blue/70">
                  <span>Shipping</span>
                  <span className="font-medium">{shippingFee === 0 && (parseFloat(shippingConfig?.settings?.free_shipping_threshold) || 0) > 0 ? <span className="text-green-600 font-bold">FREE</span> : `$${shippingFee.toFixed(2)}`}</span>
                </div>
                {(taxAmount > 0 || shippingConfig?.settings?.tax_mode === 'pincode') && (
                  <div className="flex justify-between text-sm text-brand-dark-blue/70">
                    <span>{taxLabel || 'Tax'}</span><span className="font-medium">${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-brand-dark-blue text-base pt-2 border-t border-brand-gold/20">
                  <span>Grand Total</span><span className="text-brand-gold">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

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
            <h2 className="text-xl font-bold text-brand-dark-blue flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-brand-gold" />
              </div>
              Shipping Address
            </h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-brand-gold/20 overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Full Name *</label>
                  <input
                    required
                    value={address.name}
                    onChange={e => setAddress({...address, name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Address Line 1 */}
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Address Line 1 *</label>
                  <input
                    required
                    value={address.line1}
                    onChange={e => setAddress({...address, line1: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 transition-all"
                    placeholder="House no., Street, Area"
                  />
                </div>

                {/* City + State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">City *</label>
                    <input
                      required
                      value={address.city}
                      onChange={e => setAddress({...address, city: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 transition-all"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">State *</label>
                    <input
                      required
                      value={address.state}
                      onChange={e => setAddress({...address, state: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 transition-all"
                      placeholder="State"
                    />
                  </div>
                </div>

                {/* ZIP + Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">ZIP Code *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={address.pincode}
                      onChange={e => setAddress({...address, pincode: e.target.value.replace(/\D/g, '')})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 transition-all"
                      placeholder="6-digit ZIP"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Mobile *</label>
                    <PhoneInput value={address.mobile} onChange={v => setAddress({...address, mobile: v})} placeholder="Mobile number" />
                  </div>
                </div>

                {/* Country */}
                <div ref={countryRef} className="relative">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Country *</label>
                  <button
                    type="button"
                    onClick={() => { setCountryOpen(o => !o); setCountrySearch(''); }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 transition-all flex items-center justify-between"
                  >
                    <span className={address.country ? 'text-gray-700' : 'text-gray-400'}>
                      {address.country || 'Select country'}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${countryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {countryOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                      {/* Search */}
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                          </svg>
                          <input
                            autoFocus
                            type="text"
                            value={countrySearch}
                            onChange={e => setCountrySearch(e.target.value)}
                            placeholder="Search country..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-brand-gold"
                          />
                        </div>
                      </div>
                      {/* List */}
                      <ul className="max-h-48 overflow-y-auto">
                        {COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase())).map(c => (
                          <li key={c}>
                            <button
                              type="button"
                              onClick={() => { setAddress({...address, country: c}); setCountryOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                address.country === c
                                  ? 'bg-brand-gold/10 text-brand-dark-blue font-bold'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {c}
                            </button>
                          </li>
                        ))}
                        {COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 && (
                          <li className="px-4 py-3 text-sm text-gray-400 text-center">No country found</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Proceed button inside card on mobile */}
              <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-brand-dark-blue text-brand-gold font-bold text-sm rounded-xl py-4 shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" /> Proceed to Payment
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[11px] text-gray-400">100% Secure Transaction</span>
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
              Payment
            </h2>
            <div className="bg-white/80 p-5 rounded-2xl shadow-sm border border-brand-gold/20">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Card Details</p>
              <Elements stripe={stripePromise}>
                <StripeCardForm onReady={setStripeCardElement} />
              </Elements>
            </div>
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
                  <span className="font-medium text-brand-dark-blue">{shippingFee === 0 && (parseFloat(shippingConfig?.settings?.free_shipping_threshold) || 0) > 0 ? <span className="text-green-600 font-bold">FREE</span> : `$${shippingFee.toFixed(2)}`}</span>
                </div>
                {(taxAmount > 0 || shippingConfig?.settings?.tax_mode === 'pincode') && (
                  <div className="flex justify-between text-sm text-brand-dark-blue/80 mb-2">
                    <span>{taxLabel || 'Tax'}</span>
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
              <>
                <p className="text-xs font-bold text-brand-dark-blue/60 uppercase tracking-wider mb-1">Payable Amount</p>
                <div className="flex flex-col">
                  {appliedCoupon && <span className="text-[10px] text-brand-gold font-bold -mb-1">Code applied: {appliedCoupon.code}</span>}
                  <p className="text-2xl font-bold text-brand-dark-blue leading-none">${finalTotal.toFixed(2)}</p>
                </div>
              </>
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
