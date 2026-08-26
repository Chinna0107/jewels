import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, Search, User, UserPlus, Package, MapPin, 
  CreditCard, Truck, CheckCircle2, ChevronRight, Store, Loader2, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function AdminCreateOrderPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Data sources
  const [allProducts, setAllProducts] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);

  // Form State
  const [orderType, setOrderType] = useState("shipping"); // 'shipping' | 'pickup'
  const [paymentMethod, setPaymentMethod] = useState("offline"); // 'offline' | 'payment_link'
  
  // Customer State
  const [customerMode, setCustomerMode] = useState("search"); // 'search' | 'manual'
  const [searchCustomerQuery, setSearchCustomerQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [manualCustomer, setManualCustomer] = useState({
    name: "", email: "", mobile: "", line1: "", line2: "", city: "", state: "", pincode: "", country: "United States"
  });

  // Product Search State
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Cart State
  const [cart, setCart] = useState([]); // { product, variant, size, qty }

  // Pricing State
  const [manualTax, setManualTax] = useState(false);
  const [taxAmount, setTaxAmount] = useState(0);
  const [manualShipping, setManualShipping] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const [productsRes, usersRes] = await Promise.all([
          fetch(`${BACKEND_URL}/admin/products`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BACKEND_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const productsData = await productsRes.json();
        const usersData = await usersRes.json();
        
        setAllProducts(productsData.products || []);
        setAllCustomers(usersData.users || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const parseArray = (str) => {
    try { return typeof str === 'string' ? JSON.parse(str) : (Array.isArray(str) ? str : []); }
    catch { return []; }
  };

  const filteredCustomers = allCustomers.filter(c => 
    c.name?.toLowerCase().includes(searchCustomerQuery.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchCustomerQuery.toLowerCase()) ||
    c.phone?.includes(searchCustomerQuery)
  );

  const filteredProducts = allProducts.filter(p => {
    const search = searchProductQuery.toLowerCase();
    const variants = parseArray(p.variants);
    const hasCode = variants.some(v => (v.sizes || []).some(s => s.code?.toLowerCase().includes(search)));
    return p.name?.toLowerCase().includes(search) || p.product_code?.toLowerCase().includes(search) || hasCode;
  });

  const addToCart = (product, variant, size, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.size.size === size.size && item.variant.color === variant.color);
      if (existing) {
        return prev.map(item => item === existing ? { ...item, qty: item.qty + qty } : item);
      }
      return [...prev, { product, variant, size, qty }];
    });
    setSearchProductQuery("");
    setShowProductDropdown(false);
  };

  const updateCartQty = (index, delta) => {
    setCart(prev => {
      const newCart = [...prev];
      newCart[index].qty += delta;
      if (newCart[index].qty <= 0) {
        newCart.splice(index, 1);
      }
      return newCart;
    });
  };

  const removeCartItem = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.size.our_price || item.size.mrp || item.size.price || item.product.price || 0) * item.qty, 0);
  
  // Auto tax (simplified standard 7% if not manual)
  const calculatedTax = manualTax ? Number(taxAmount) : subtotal * 0.07;
  
  // Auto shipping (simplified $10 if not manual)
  const calculatedShipping = orderType === 'pickup' ? 0 : (manualShipping ? Number(shippingFee) : (subtotal > 200 ? 0 : 10));

  const total = Math.max(0, subtotal + calculatedTax + calculatedShipping - Number(discountAmount));

  const handleSubmit = async () => {
    setError("");
    if (cart.length === 0) return setError("Cart is empty");
    if (customerMode === 'search' && !selectedCustomer) return setError("Please select a customer");
    
    let addressPayload = {};
    if (customerMode === 'manual') {
      if (!manualCustomer.name || !manualCustomer.email || !manualCustomer.mobile || (orderType === 'shipping' && !manualCustomer.line1)) {
        return setError("Please fill all required manual customer details");
      }
      addressPayload = { ...manualCustomer };
    } else {
      // Assuming selected customer has a default address or we just pass the ID
      // If we don't have their address, the backend might need it, but let's pass what we can
      addressPayload = {
        name: selectedCustomer.name,
        email: selectedCustomer.email,
        mobile: selectedCustomer.phone || '',
        user_id: selectedCustomer.id
      };
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      const orderPayload = {
        user_id: addressPayload.user_id || null,
        items: cart.map(item => ({
          product: item.product,
          variant: {
            color: item.variant.color,
            size: item.size.size,
            price: Number(item.size.our_price || item.size.mrp || item.size.price || item.product.price || 0),
            size_code: item.size.code,
            image: (item.variant.images && item.variant.images.length > 0) ? item.variant.images[0] : (item.product.images && item.product.images.length > 0) ? item.product.images[0] : item.product.image_url
          },
          qty: item.qty
        })),
        address: addressPayload,
        total,
        subtotal,
        tax_amount: calculatedTax,
        shipping_fee: calculatedShipping,
        discount_amount: Number(discountAmount),
        coupon_code: couponCode,
        order_type: orderType,
        payment_method: paymentMethod, // 'offline' or 'payment_link'
        is_admin_created: true
      };

      const endpoint = `${BACKEND_URL}/admin/orders`;
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create order");
      }

      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#08183A]" />
      </div>
    );
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mt-12 bg-white rounded-3xl shadow-xl p-12 text-center border border-[#08183A]/10">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-[#08183A] mb-4">Order Created Successfully!</h2>
        <p className="text-gray-500 mb-8">The manual order has been successfully placed in the system.</p>
        <div className="flex justify-center gap-4">
          <button onClick={() => window.location.href = '/admin/orders'} className="px-6 py-3 bg-[#08183A] text-white rounded-xl font-semibold hover:bg-[#122A5C] transition-all">View All Orders</button>
          <button onClick={() => { setSuccess(false); setCart([]); setSelectedCustomer(null); }} className="px-6 py-3 bg-gray-100 text-[#08183A] rounded-xl font-semibold hover:bg-gray-200 transition-all">Create Another</button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#08183A]">Create New Order</h1>
        <p className="text-[#08183A]/60">Manually draft an order on behalf of a customer.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Config */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Selection */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-serif font-bold text-[#08183A] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-500" /> Customer Details
            </h2>
            
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6 w-full sm:w-fit">
              <button 
                onClick={() => setCustomerMode('search')}
                className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-all ${customerMode === 'search' ? 'bg-white text-[#08183A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Existing Customer
              </button>
              <button 
                onClick={() => setCustomerMode('manual')}
                className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-all ${customerMode === 'manual' ? 'bg-white text-[#08183A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Guest / Manual
              </button>
            </div>

            {customerMode === 'search' ? (
              <div className="relative">
                {selectedCustomer ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-emerald-900">{selectedCustomer.name}</p>
                      <p className="text-sm text-emerald-700">{selectedCustomer.email} • {selectedCustomer.phone || 'No phone'}</p>
                    </div>
                    <button onClick={() => setSelectedCustomer(null)} className="text-emerald-700 hover:text-emerald-900 text-sm font-semibold underline">Change</button>
                  </div>
                ) : (
                  <>
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search by name, email, or phone..." 
                      value={searchCustomerQuery}
                      onChange={(e) => setSearchCustomerQuery(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#08183A]"
                    />
                    {searchCustomerQuery && (
                      <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                          <li key={c.id}>
                            <button onClick={() => { setSelectedCustomer(c); setSearchCustomerQuery(""); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                              <p className="font-bold text-sm text-[#08183A]">{c.name}</p>
                              <p className="text-xs text-gray-500">{c.email} {c.phone ? `• ${c.phone}` : ''}</p>
                            </button>
                          </li>
                        )) : (
                          <li className="px-4 py-3 text-sm text-gray-500">No customers found.</li>
                        )}
                      </ul>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Full Name *</label>
                  <input type="text" value={manualCustomer.name} onChange={e => setManualCustomer({...manualCustomer, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#08183A]" placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Email Address *</label>
                  <input type="email" value={manualCustomer.email} onChange={e => setManualCustomer({...manualCustomer, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#08183A]" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Phone Number *</label>
                  <input type="tel" value={manualCustomer.mobile} onChange={e => setManualCustomer({...manualCustomer, mobile: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#08183A]" placeholder="+1 234 567 8900" />
                </div>
                <div className="sm:col-span-2 mt-2">
                  <p className="text-sm font-bold text-[#08183A] mb-3">Shipping Address {orderType === 'pickup' && '(Optional for Pickup)'}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <input type="text" value={manualCustomer.line1} onChange={e => setManualCustomer({...manualCustomer, line1: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#08183A]" placeholder="Street Address" />
                    </div>
                    <div>
                      <input type="text" value={manualCustomer.city} onChange={e => setManualCustomer({...manualCustomer, city: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#08183A]" placeholder="City" />
                    </div>
                    <div>
                      <input type="text" value={manualCustomer.state} onChange={e => setManualCustomer({...manualCustomer, state: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#08183A]" placeholder="State" />
                    </div>
                    <div>
                      <input type="text" value={manualCustomer.pincode} onChange={e => setManualCustomer({...manualCustomer, pincode: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#08183A]" placeholder="Zip / Postal Code" />
                    </div>
                    <div>
                      <input type="text" value={manualCustomer.country} onChange={e => setManualCustomer({...manualCustomer, country: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#08183A]" placeholder="Country" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Selection */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-serif font-bold text-[#08183A] mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" /> Add Products
            </h2>
            
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products by name or code..." 
                value={searchProductQuery}
                onFocus={() => setShowProductDropdown(true)}
                onChange={(e) => { setSearchProductQuery(e.target.value); setShowProductDropdown(true); }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#08183A]"
              />
              {showProductDropdown && searchProductQuery && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                  <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0">
                    <span className="text-xs font-bold text-gray-500 uppercase">Search Results</span>
                    <button onClick={() => setShowProductDropdown(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                  </div>
                  {filteredProducts.length > 0 ? filteredProducts.map(p => {
                    const variants = parseArray(p.variants);
                    return variants.map(v => (
                      (v.sizes || []).map(s => (
                        <div key={`${p.id}-${v.color}-${s.size}`} className="flex items-center justify-between p-3 border-b border-gray-50 hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {(v.images && v.images.length > 0) ? <img src={v.images[0]} alt={p.name} className="w-full h-full object-cover" /> : (p.images && parseArray(p.images)[0]) ? <img src={parseArray(p.images)[0]} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-400" />}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-[#08183A]">{p.name}</p>
                              <p className="text-xs text-gray-500">{v.color} • {s.size} {s.code ? `• Code: ${s.code}` : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-[#08183A]">${s.our_price || s.mrp || s.price || p.price || 0}</span>
                            <button 
                              onClick={() => addToCart(p, v, s)}
                              className="px-3 py-1.5 bg-[#08183A] text-white text-xs font-bold rounded-lg hover:bg-[#122A5C] transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ))
                    ));
                  }) : (
                    <div className="p-4 text-center text-gray-500 text-sm">No products found.</div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length > 0 && (
              <div className="mt-6 space-y-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 p-1">
                        {(item.variant.images && item.variant.images.length > 0) ? <img src={item.variant.images[0]} className="w-full h-full object-contain" alt="" /> : (item.product.images && parseArray(item.product.images)[0]) ? <img src={parseArray(item.product.images)[0]} className="w-full h-full object-contain" alt="" /> : <Package className="w-full h-full text-gray-300" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#08183A]">{item.product.name}</p>
                        <p className="text-xs text-gray-500">{item.variant.color} • {item.size.size} {item.size.code ? `• ${item.size.code}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-bold text-[#08183A]">${item.size.our_price || item.size.mrp || item.size.price || item.product.price || 0}</span>
                      <div className="flex items-center bg-white border border-gray-200 rounded-lg h-8">
                        <button onClick={() => updateCartQty(idx, -1)} className="px-2.5 text-gray-500 hover:text-[#08183A]">-</button>
                        <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                        <button onClick={() => updateCartQty(idx, 1)} className="px-2.5 text-gray-500 hover:text-[#08183A]">+</button>
                      </div>
                      <button onClick={() => removeCartItem(idx)} className="text-red-400 hover:text-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-serif font-bold text-[#08183A] mb-6 flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-500" /> Order Settings
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Order Type */}
              <div>
                <label className="text-sm font-bold text-[#08183A] mb-3 block">Fulfillment Method</label>
                <div className="flex gap-2">
                  <button onClick={() => setOrderType('shipping')} className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${orderType === 'shipping' ? 'border-[#08183A] bg-[#08183A]/5 text-[#08183A]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <Truck className="w-5 h-5" />
                    <span className="text-xs font-bold">Shipping</span>
                  </button>
                  <button onClick={() => setOrderType('pickup')} className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${orderType === 'pickup' ? 'border-[#08183A] bg-[#08183A]/5 text-[#08183A]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <Store className="w-5 h-5" />
                    <span className="text-xs font-bold">Pickup</span>
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-sm font-bold text-[#08183A] mb-3 block">Payment Method</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="radio" name="paymentMethod" value="offline" checked={paymentMethod === 'offline'} onChange={() => setPaymentMethod('offline')} className="w-4 h-4 accent-[#08183A]" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#08183A]">Offline / Cash</span>
                      <span className="text-[10px] text-gray-500">Mark as paid immediately</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="radio" name="paymentMethod" value="payment_link" checked={paymentMethod === 'payment_link'} onChange={() => setPaymentMethod('payment_link')} className="w-4 h-4 accent-[#08183A]" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#08183A]">Send Payment Link</span>
                      <span className="text-[10px] text-gray-500">Customer pays via email link</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[#FDF8F0] rounded-3xl p-6 border border-[#08183A]/5 sticky top-24">
            <h3 className="font-serif text-xl font-bold text-[#08183A] mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" /> Order Summary
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm text-[#08183A]/70">
                <span>Items ({cart.reduce((a,c)=>a+c.qty,0)})</span>
                <span className="font-bold text-[#08183A]">${subtotal.toFixed(2)}</span>
              </div>
              
              {/* Discount Override */}
              <div className="border-t border-gray-200/50 pt-4">
                <label className="text-xs font-bold text-[#08183A] mb-2 block">Discount Amount ($)</label>
                <div className="flex gap-2">
                  <input type="number" min="0" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#08183A]" />
                </div>
                <input type="text" placeholder="Coupon Code (Optional)" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#08183A] mt-2" />
              </div>

              {/* Shipping Override */}
              {orderType === 'shipping' && (
                <div className="border-t border-gray-200/50 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[#08183A] flex items-center gap-1.5">
                      <input type="checkbox" checked={manualShipping} onChange={e => setManualShipping(e.target.checked)} className="accent-[#08183A]" />
                      Override Shipping Fee
                    </label>
                    {!manualShipping && <span className="text-xs font-bold text-gray-500">${calculatedShipping.toFixed(2)} (Auto)</span>}
                  </div>
                  {manualShipping && (
                    <input type="number" min="0" value={shippingFee} onChange={e => setShippingFee(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#08183A]" placeholder="0.00" />
                  )}
                </div>
              )}

              {/* Tax Override */}
              <div className="border-t border-gray-200/50 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#08183A] flex items-center gap-1.5">
                    <input type="checkbox" checked={manualTax} onChange={e => setManualTax(e.target.checked)} className="accent-[#08183A]" />
                    Override Tax Amount
                  </label>
                  {!manualTax && <span className="text-xs font-bold text-gray-500">${calculatedTax.toFixed(2)} (Auto 7%)</span>}
                </div>
                {manualTax && (
                  <input type="number" min="0" value={taxAmount} onChange={e => setTaxAmount(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#08183A]" placeholder="0.00" />
                )}
              </div>

              <div className="border-t border-[#08183A]/20 pt-4 flex justify-between items-end">
                <span className="font-bold text-[#08183A]">Total</span>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block mb-0.5">USD</span>
                  <span className="font-serif text-3xl font-bold text-[#08183A]">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={submitting || cart.length === 0}
              className="w-full bg-[#08183A] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#122A5C] transition-colors disabled:opacity-50 active:scale-[0.98]"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {submitting ? 'Creating Order...' : 'Place Manual Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
