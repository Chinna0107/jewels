import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Truck, CheckCircle, MapPin, CreditCard, ChevronLeft, ShoppingCart } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Header } from '../components/Header';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useLoadScript } from '@react-google-maps/api';
import usePlacesAutocomplete, { getDetails } from 'use-places-autocomplete';

const GOOGLE_MAPS_LIBRARIES = ['places'];
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

import { COUNTRIES } from '../data/countries';

function flag(code) {
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function AddressAutocomplete({ value, onChange, onSelect }) {
  const {
    ready,
    value: inputVal,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({ debounce: 300, defaultValue: value });

  const handleInput = (e) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };

  const handleSelect = async (suggestion) => {
    setValue(suggestion.description, false);
    onChange(suggestion.description);
    clearSuggestions();
    try {
      const details = await getDetails({
        placeId: suggestion.place_id,
        fields: ['address_components', 'formatted_address'],
      });
      const components = details.address_components || [];
      const get = (type) => components.find(c => c.types.includes(type))?.long_name || '';
      onSelect({
        line1: `${get('street_number')} ${get('route')}`.trim() || suggestion.description,
        city: get('locality') || get('administrative_area_level_2') || get('postal_town'),
        state: get('administrative_area_level_1'),
        pincode: get('postal_code'),
        country: get('country'),
      });
    } catch (e) { console.error(e); }
  };

  return (
    <div className="relative">
      <MapPin className="w-4 h-4 text-brand-gold absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        value={inputVal}
        onChange={handleInput}
        disabled={!ready}
        placeholder="Start typing your address..."
        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 transition-all"
      />
      {status === 'OK' && data.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {data.map((s) => (
            <li key={s.place_id}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-brand-gold/5 flex items-start gap-2.5 border-b border-gray-50 last:border-0"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">{s.structured_formatting.main_text}</span>
                  <span className="text-gray-400 text-xs block">{s.structured_formatting.secondary_text}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#08183A',
      fontFamily: 'inherit',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
};

function StripePaymentForm({ finalTotal, isPlacingOrder, handlePlaceOrder }) {
  const stripe = useStripe();
  const elements = useElements();
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-brand-gold" />
        </div>
        Payment
      </h2>
      <div className="bg-white/80 p-5 rounded-2xl shadow-sm border border-brand-gold/20 space-y-4">
        <p className="text-xs text-brand-dark-blue/60 font-medium">Enter your card details to complete the payment</p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <button
          onClick={() => handlePlaceOrder(stripe, elements)}
          disabled={isPlacingOrder || !stripe}
          className={`w-full font-bold text-sm rounded-xl py-4 flex items-center justify-center gap-2 transition-all ${
            isPlacingOrder || !stripe ? 'opacity-70 cursor-not-allowed bg-brand-beige-darker text-brand-dark-blue/50' : 'bg-brand-dark-blue text-brand-gold shadow-lg hover:opacity-90'
          }`}
        >
          {isPlacingOrder ? (
            <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Processing...</>
          ) : `Pay $${finalTotal.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}

function StripeSubmitButton({ isPlacingOrder, handlePlaceOrder, label = 'Confirm & Pay' }) {
  const stripe = useStripe();
  const elements = useElements();
  return (
    <button
      onClick={() => handlePlaceOrder(stripe, elements)}
      disabled={isPlacingOrder || !stripe}
      className={`w-full font-bold text-base rounded-xl py-4 flex items-center justify-center gap-2 transition-all ${
        isPlacingOrder || !stripe ? 'opacity-70 cursor-not-allowed bg-brand-beige-darker text-brand-dark-blue/50' : 'bg-brand-dark-blue text-brand-gold shadow-lg shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5'
      }`}
    >
      {isPlacingOrder ? (
        <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Placing Order...</>
      ) : label}
    </button>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getTotal, getSubtotal, getDiscount, appliedCoupon, clearCart } = useCartStore();
  const { token, user } = useAuthStore();
  const { showToast } = useToastStore();

  const { isLoaded: mapsLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
  
  const [step, setStep] = useState(token ? 2 : 1);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!token) {
      navigate('/login?redirect=/checkout');
    }
  }, []);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'United States',
    mobile: user?.phone || ''
  });
  const [dialCountryCode, setDialCountryCode] = useState('US');
  const dialCode = COUNTRIES.find(c => c.code === dialCountryCode)?.dial || '+1';
  const [dialSearch, setDialSearch] = useState('');
  const [dialOpen, setDialOpen] = useState(false);
  const dialRef = useRef(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (countryRef.current && !countryRef.current.contains(e.target)) setCountryOpen(false);
      if (dialRef.current && !dialRef.current.contains(e.target)) setDialOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
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
      .then(d => {
        setShippingConfig(d);
        const allowed = d?.settings?.allowed_countries || [];
        if (allowed.length > 0 && !allowed.includes(address.country)) {
          const defaultCountryName = allowed[0];
          setAddress(a => ({ ...a, country: defaultCountryName }));
          const cObj = COUNTRIES.find(c => c.name === defaultCountryName);
          if (cObj) setDialCountryCode(cObj.code);
        }
      })
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

  const createOrder = async (pMethod, stripePaymentIntentId) => {
    const endpoint = token ? `${BACKEND_URL}/auth/orders` : `${BACKEND_URL}/general/orders`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ items, address, total: finalTotal, coupon_code: couponCode, payment_method: pMethod, stripe_payment_intent_id: stripePaymentIntentId })
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
    const mobileDigits = address.mobile.replace(/\D/g, '');
    if (['US', 'CA', 'IN'].includes(dialCountryCode)) {
      if (mobileDigits.length !== 10) {
        showToast(`Please enter a valid 10-digit mobile number for ${dialCountryCode === 'IN' ? 'India' : 'US/Canada'}.`, 'error');
        return;
      }
    } else if (mobileDigits.length < 5 || mobileDigits.length > 15) {
      showToast('Please enter a valid mobile number.', 'error');
      return;
    }
    setStep(3);
  };

  const handlePlaceOrder = async (stripe, elements) => {
    if (!stripe || !elements) return;
    setIsPlacingOrder(true);
    try {
      const intentRes = await fetch(`${BACKEND_URL}/general/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal })
      });
      const intentData = await intentRes.json();
      if (!intentData.success) { showToast('Failed to initialize payment', 'error'); setIsPlacingOrder(false); return; }

      const { error, paymentIntent } = await stripe.confirmCardPayment(intentData.clientSecret, {
        payment_method: { card: elements.getElement(CardElement), billing_details: { name: address.name } }
      });

      if (error) { showToast(error.message, 'error'); setIsPlacingOrder(false); return; }

      if (paymentIntent.status === 'succeeded') {
        const createOrderData = await createOrder('stripe', paymentIntent.id);
        if (createOrderData.success) {
          setTimeout(() => { clearCart(); navigate(`/order-tracking/${createOrderData.order.order_number}`); }, 2000);
        } else {
          showToast('Failed to place order after payment.', 'error');
          setIsPlacingOrder(false);
        }
      }
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

  const allowedCountries = shippingConfig?.settings?.allowed_countries || [];
  const displayCountries = allowedCountries.length > 0 
    ? COUNTRIES.filter(c => allowedCountries.includes(c.name))
    : COUNTRIES;

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

                {/* Address Line 1 — Google Places Autocomplete */}
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Address Line 1 *</label>
                  {mapsLoaded ? (
                    <AddressAutocomplete
                      value={address.line1}
                      onChange={v => setAddress(a => ({ ...a, line1: v }))}
                      onSelect={({ line1, city, state, pincode, country }) =>
                        setAddress(a => ({
                          ...a,
                          line1: line1 || a.line1,
                          city: city || a.city,
                          state: state || a.state,
                          pincode: pincode || a.pincode,
                          country: country || a.country,
                        }))
                      }
                    />
                  ) : (
                    <input
                      value={address.line1}
                      onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))}
                      placeholder="House no., Street, Area"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 transition-all"
                    />
                  )}
                  <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Selecting a suggestion auto-fills city, state, ZIP & country
                  </p>
                </div>

                {/* Apartment */}
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Apartment, suite, etc. (optional)</label>
                  <input
                    value={address.line2}
                    onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 transition-all"
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
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Phone *</label>
                    <div className="flex gap-2">
                      {/* Dial code picker */}
                      <div ref={dialRef} className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => { setDialOpen(o => !o); setDialSearch(''); }}
                          className="h-full min-w-[80px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm flex items-center gap-1.5 focus:outline-none focus:border-brand-gold hover:border-brand-gold/50 transition-all"
                        >
                          <span>{flag(dialCountryCode)}</span>
                          <span className="font-bold text-gray-700">{dialCode}</span>
                          <svg className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ${dialOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {dialOpen && (
                          <div className="absolute z-50 mt-1 left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                            <div className="p-2 border-b border-gray-100">
                              <input
                                autoFocus
                                type="text"
                                value={dialSearch}
                                onChange={e => setDialSearch(e.target.value)}
                                placeholder="Search country..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-gold"
                              />
                            </div>
                            <ul className="max-h-52 overflow-y-auto">
                              {displayCountries.filter(c =>
                                c.name.toLowerCase().includes(dialSearch.toLowerCase()) ||
                                c.dial.includes(dialSearch)
                              ).map(c => (
                                <li key={c.code}>
                                  <button
                                    type="button"
                                    onClick={() => { setDialCountryCode(c.code); setDialOpen(false); }}
                                    className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                                      dialCountryCode === c.code ? 'bg-brand-gold/10 font-bold text-brand-dark-blue' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    <span className="text-base">{flag(c.code)}</span>
                                    <span className="flex-1 truncate">{c.name}</span>
                                    <span className="text-gray-400 font-mono text-xs shrink-0">{c.dial}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {/* Number input */}
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        value={address.mobile}
                        maxLength={['IN', 'US', 'CA'].includes(dialCountryCode) ? 10 : 15}
                        onChange={e => {
                          const limit = ['IN', 'US', 'CA'].includes(dialCountryCode) ? 10 : 15;
                          setAddress({...address, mobile: e.target.value.replace(/\D/g, '').slice(0, limit)});
                        }}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 transition-all"
                        placeholder={['IN', 'US', 'CA'].includes(dialCountryCode) ? '10-digit number' : 'Phone number'}
                      />
                    </div>
                  </div>
                </div>

                {/* Country */}
                <div ref={countryRef} className="relative">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Country *</label>
                  <button
                    type="button"
                    onClick={() => { setCountryOpen(o => !o); setCountrySearch(''); }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 transition-all flex items-center gap-2 justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {address.country && (() => { const c = COUNTRIES.find(c => c.name === address.country); return c ? <span className="text-base shrink-0">{flag(c.code)}</span> : null; })()}
                      <span className={`truncate ${address.country ? 'text-gray-700' : 'text-gray-400'}`}>{address.country || 'Select country'}</span>
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${countryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {countryOpen && (
                    <div className="absolute z-[200] bottom-full mb-1 w-full bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <input
                          autoFocus
                          type="text"
                          value={countrySearch}
                          onChange={e => setCountrySearch(e.target.value)}
                          placeholder="Search country..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-gold"
                        />
                      </div>
                      <ul className="max-h-52 overflow-y-auto">
                        {displayCountries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).map(c => (
                          <li key={c.code}>
                            <button
                              type="button"
                              onClick={() => {
                                setAddress({...address, country: c.name});
                                setDialCountryCode(c.code);
                                setCountryOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                                address.country === c.name ? 'bg-brand-gold/10 text-brand-dark-blue font-bold' : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <span className="text-base shrink-0">{flag(c.code)}</span>
                              <span className="flex-1 truncate">{c.name}</span>
                              <span className="text-gray-400 font-mono text-xs shrink-0">{c.dial}</span>
                            </button>
                          </li>
                        ))}
                        {COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 && (
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
          <Elements stripe={stripePromise}>
            <StripePaymentForm
              finalTotal={finalTotal}
              isPlacingOrder={isPlacingOrder}
              handlePlaceOrder={handlePlaceOrder}
            />
          </Elements>
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

              {step === 2 ? (
                <button 
                  onClick={handleProceedToPayment}
                  className="w-full bg-brand-dark-blue text-brand-gold font-bold text-base rounded-xl py-4 shadow-lg shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Payment
                </button>
              ) : (
                <Elements stripe={stripePromise}>
                  <StripeSubmitButton isPlacingOrder={isPlacingOrder} handlePlaceOrder={handlePlaceOrder} />
                </Elements>
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
          
          {step === 2 ? (
            <button 
              onClick={handleProceedToPayment}
              className="w-full bg-brand-dark-blue text-brand-gold font-bold text-base rounded-xl py-4 shadow-lg shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Payment
              <span className="w-1 h-1 bg-white rounded-full mx-1 opacity-50" />
              
            </button>
          ) : (
            <Elements stripe={stripePromise}>
              <StripeSubmitButton isPlacingOrder={isPlacingOrder} handlePlaceOrder={handlePlaceOrder} label="Confirm Order" />
            </Elements>
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
