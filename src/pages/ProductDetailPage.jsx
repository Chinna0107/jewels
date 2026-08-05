import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Share2, Heart, ShoppingCart, Star, ShieldCheck, Truck, RefreshCcw, Check, ChevronRight, User } from 'lucide-react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { ImageZoom } from '../components/ImageZoom';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useStoreData } from '../store/useStoreData';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const variantCode = searchParams.get('variantCode');
  const { products, loading, fetchData } = useStoreData();
  const product = products.find(p => p.id.toString() === id);
  const { addToCart } = useCartStore();
  const { toggleWishlist, items: wishlistItems } = useWishlistStore();
  
  // Backwards compatibility for old product formats
  let variants = product?.variants;
  if (product && (!variants || variants.length === 0)) {
    variants = [{
      color: product.color || "",
      images: product.images || (product.image_url ? [product.image_url] : []),
      sizes: product.sizes ? product.sizes.map(s => ({ size: s.size, mrp: s.price, our_price: s.price })) : []
    }];
  }

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  const isWishlisted = product ? wishlistItems.includes(product.id) : false;
  
  const { offers } = useStoreData();
  const activeOffer = product?.offer_id ? offers?.find(o => o.id === product.offer_id && o.is_active) : null;
  
  const container = useRef(null);
  const [mainImg, setMainImg] = useState(null);

  // Determine Related Products
  const relatedProducts = product ? products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4) : [];

  useEffect(() => {
    // Reset state when ID changes
    setMainImg(null);
    setSelectedVariant(null);
    setSelectedSize(null);
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (variants && variants.length > 0 && !selectedVariant) {
      let match = null;
      if (variantCode) {
        match = variants.find(v => v.code === variantCode);
      }
      setSelectedVariant(match || variants[0]);
    }
  }, [variants, selectedVariant, variantCode]);

  useEffect(() => {
    if (selectedVariant && selectedVariant.sizes && selectedVariant.sizes.length > 0) {
      setSelectedSize(selectedVariant.sizes[0]);
    } else {
      setSelectedSize(null);
    }
    
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      setMainImg(selectedVariant.images[0]);
    } else {
      setMainImg(null);
    }
  }, [selectedVariant]);

  useGSAP(() => {
    if (product && !loading) {
      gsap.from('.animate-image', {
        x: -40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        clearProps: 'all'
      });
      
      gsap.from('.animate-info', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'all'
      });
    }
  }, { scope: container, dependencies: [product, loading, id] });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-beige">
        <div className="w-10 h-10 border-4 border-brand-dark-blue/20 border-t-brand-dark-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-brand-beige text-brand-dark-blue">
        <h2 className="text-2xl font-serif font-bold mb-2">Product Not Found</h2>
        <p className="mb-6 opacity-70">The jewelry piece you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} className="bg-brand-dark-blue text-brand-gold px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
          Return to Collections
        </button>
      </div>
    );
  }

  const getDisplayPrice = (original) => {
    if (activeOffer) return Math.round(original - (original * (activeOffer.discount_percentage / 100)));
    return original;
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const sizeToUse = selectedSize || { size: 'Standard', mrp: 0, our_price: 0 };
    const priceToUse = getDisplayPrice(Number(sizeToUse.our_price) || Number(sizeToUse.mrp) || 0);
    const itemColor = selectedVariant?.color || product.color;
    addToCart(product, { ...sizeToUse, price: priceToUse }, quantity, itemColor);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
    navigate('/cart');
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product.id);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };



  const productImages = selectedVariant?.images || [];
  const productSizes = selectedVariant?.sizes || [];
  
  const currentMrp = selectedSize ? (Number(selectedSize.mrp) || Number(selectedSize.our_price)) : 0;
  const currentOurPrice = selectedSize ? (Number(selectedSize.our_price) || currentMrp) : 0;
  const displayPrice = getDisplayPrice(currentOurPrice);
  
  const currentStock = selectedSize && selectedSize.stock !== undefined 
    ? Number(selectedSize.stock) 
    : Number(product.stock || 0);
  const isOutOfStock = currentStock <= 0;

  let avgRating = 0;
  let reviewCount = 0;
  let reviews = product.reviews || [];
  if (typeof reviews === 'string') {
    try { reviews = JSON.parse(reviews); } catch(e) { reviews = []; }
  }
  if (!Array.isArray(reviews)) reviews = [];
  if (reviews.length > 0) {
    const total = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
    avgRating = (total / reviews.length).toFixed(1);
    reviewCount = reviews.length;
  }

  return (
    <div ref={container} className="min-h-screen bg-brand-beige font-sans pb-28 md:pb-12">
      <Header showShare={true} />
      
      {/* Breadcrumbs */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-4 md:pt-10 md:pb-8">
        <div className="flex items-center gap-2 text-xs md:text-sm text-brand-dark-blue/60 font-medium">
          <button onClick={() => navigate('/')} className="hover:text-brand-dark-blue transition-colors">Home</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => navigate('/category/all')} className="hover:text-brand-dark-blue transition-colors">Collections</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-brand-dark-blue line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        <div className="md:grid md:grid-cols-12 md:gap-12 lg:gap-16 items-start">
          
          {/* Left: Product Image Gallery */}
          <div className="md:col-span-5 animate-image mb-8 md:mb-0 md:sticky md:top-32">
            <div className="w-full aspect-square relative rounded-2xl overflow-hidden shadow-sm bg-white">
              {product.is_bestseller && !activeOffer && (
                <div className="absolute top-4 left-4 bg-brand-gold text-brand-dark-blue text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-sm">
                  Bestseller
                </div>
              )}
              {activeOffer && (
                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-sm">
                  {activeOffer.discount_percentage}% OFF
                </div>
              )}
              {mainImg ? (
                <div className="w-full h-full p-4">
                  <ImageZoom 
                    src={mainImg} 
                    alt={product.name} 
                    className="w-full h-full rounded-xl" 
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Available</div>
              )}
            </div>
            
            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto hide-scrollbar mt-4 pb-2">
                {productImages.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setMainImg(img)}
                    className={`w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 transition-all ${mainImg === img ? 'border-2 border-brand-dark-blue shadow-sm' : 'border-2 border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info & Actions */}
          <div className="md:col-span-7 space-y-8 pb-8">
            
            {/* Header Info */}
            <div className="animate-info space-y-2">
              <h1 className="text-3xl md:text-[40px] font-serif font-bold text-brand-dark-blue leading-tight">
                {product.name}
              </h1>
              {(selectedVariant?.code || product.product_code) && (
                <p className="text-gray-500 font-mono text-sm tracking-wider">CODE: {selectedVariant?.code || product.product_code}</p>
              )}
              
              {reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-brand-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(avgRating) ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    {avgRating} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>

            <div className="animate-info">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-bold text-brand-dark-blue">
                  ${displayPrice.toLocaleString()}
                </span>
                {(activeOffer || currentMrp > currentOurPrice) && (
                  <span className="text-xl md:text-2xl font-bold text-gray-400 line-through">
                    ${currentMrp.toLocaleString()}
                  </span>
                )}
              </div>
              {currentStock > 0 && currentStock <= 5 && (
                <p className="text-sm font-bold text-red-500 mt-2 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Only {currentStock} left in stock!
                </p>
              )}
              {isOutOfStock && (
                <p className="text-sm font-bold text-gray-400 mt-2">Out of Stock</p>
              )}
            </div>

            {/* <div className="animate-info">
              <h3 className="font-bold text-brand-dark-blue text-lg mb-2">About this product</h3>
              <p className="text-brand-dark-blue/70 leading-relaxed font-medium">
                {product.description || "Beautifully crafted jewelry piece, perfect for any occasion. Made with premium materials to ensure lasting elegance and durability."}
              </p>
            </div> */}

            {/* Variants Selection */}
            <div className="animate-info space-y-6">
              
              {/* Colors */}
              {variants && variants.length > 1 && (
                <div>
                  <h3 className="font-bold text-brand-dark-blue text-lg mb-3">Color: <span className="text-brand-gold">{selectedVariant?.color}</span></h3>
                  <div className="flex gap-3 flex-wrap">
                    {variants.map((v, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-xl border-2 font-bold transition-colors ${
                          selectedVariant === v ? 'border-brand-dark-blue bg-brand-dark-blue text-white' : 'border-gray-200 bg-white text-brand-dark-blue hover:border-brand-dark-blue/50'
                        }`}
                      >
                        {v.color || `Variant ${idx+1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {productSizes && productSizes.length > 0 && (
                <div>
                  <h3 className="font-bold text-brand-dark-blue text-lg mb-3">Select Size</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {productSizes.map((sizeObj, idx) => {
                      const isSelected = selectedSize?.size === sizeObj.size;
                      const szMrp = Number(sizeObj.mrp) || Number(sizeObj.our_price);
                      const szOur = Number(sizeObj.our_price) || szMrp;
                      const displaySzPrice = getDisplayPrice(szOur);
                      
                      const szStock = sizeObj.stock !== undefined ? Number(sizeObj.stock) : Number(product.stock || 0);
                      const isSzOutOfStock = szStock <= 0;
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedSize(sizeObj)}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 relative ${
                            isSelected 
                              ? 'border-brand-dark-blue bg-brand-dark-blue/5' 
                              : 'border-brand-dark-blue/10 bg-transparent hover:border-brand-dark-blue/30'
                          } ${isSzOutOfStock ? 'opacity-60' : ''}`}
                        >
                          <span className={`font-bold text-base ${isSelected ? 'text-brand-dark-blue' : 'text-brand-dark-blue/80'}`}>{sizeObj.size}</span>
                          <span className={`font-bold mt-1 ${isSelected ? 'text-brand-gold' : 'text-brand-dark-blue/50'}`}>${displaySzPrice}</span>
                          {(szMrp > szOur || activeOffer) && (
                            <span className="text-[10px] line-through text-gray-400">${szMrp}</span>
                          )}
                          {isSzOutOfStock ? (
                            <span className="absolute top-1 right-1 text-[8px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">Sold Out</span>
                          ) : szStock <= 5 && szStock > 0 ? (
                            <span className="absolute top-1 right-1 text-[8px] bg-orange-100 text-orange-600 font-bold px-1.5 py-0.5 rounded">{szStock} left</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="font-bold text-brand-dark-blue text-lg mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    disabled={isOutOfStock}
                    className="w-12 h-12 rounded-xl bg-white text-brand-dark-blue font-bold text-xl flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors border border-gray-100 disabled:opacity-50"
                  >-</button>
                  <span className="w-12 text-center font-bold text-brand-dark-blue text-xl">{isOutOfStock ? 0 : quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(quantity + 1, currentStock))} 
                    disabled={isOutOfStock || quantity >= currentStock}
                    className="w-12 h-12 rounded-xl bg-white text-brand-dark-blue font-bold text-xl flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors border border-gray-100 disabled:opacity-50"
                  >+</button>
                </div>
                {currentStock > 0 && currentStock <= 5 && (
                  <p className="text-xs text-red-500 font-bold mt-2">Only {currentStock} left in stock!</p>
                )}
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="animate-info hidden md:flex items-center gap-4 pt-4">
              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-lg ${
                  isOutOfStock 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-brand-dark-blue text-brand-gold hover:bg-brand-dark-blue/90 shadow-brand-dark-blue/20'
                }`}
              >
                <ShoppingCart className="w-5 h-5" /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              
              <button 
                onClick={handleWishlist}
                className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100 hover:scale-105 transition-transform flex-shrink-0 group"
              >
                <Heart className={`w-6 h-6 transition-colors ${isWishlisted ? 'fill-brand-gold text-brand-gold' : 'text-brand-dark-blue group-hover:text-brand-gold'}`} />
              </button>
              
              <button 
                onClick={handleShare}
                className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100 hover:scale-105 transition-transform flex-shrink-0 group"
              >
                <Share2 className="w-5 h-5 text-brand-dark-blue group-hover:text-brand-gold transition-colors" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="animate-info grid grid-cols-3 gap-3 pt-4">
              <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl border border-brand-beige/50 text-center gap-2 shadow-sm">
                <ShieldCheck className="w-6 h-6 text-brand-gold" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-brand-dark-blue leading-tight">100%<br/>Guarantee</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl border border-brand-beige/50 text-center gap-2 shadow-sm">
                <Truck className="w-6 h-6 text-brand-gold" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-brand-dark-blue leading-tight">Free<br/>Shipping</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl border border-brand-beige/50 text-center gap-2 shadow-sm">
                <RefreshCcw className="w-6 h-6 text-brand-gold" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-brand-dark-blue leading-tight">7-Day<br/>Returns</span>
              </div>
            </div>

            {/* Product Details Tabs */}
            <div className="animate-info bg-white rounded-2xl shadow-sm border border-brand-beige/50 overflow-hidden mt-8">
              <div className="flex border-b border-gray-100">
                <button 
                  onClick={() => setActiveTab('description')}
                  className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'description' ? 'text-brand-dark-blue border-b-2 border-brand-gold bg-brand-dark-blue/5' : 'text-gray-400 hover:text-brand-dark-blue'}`}
                >
                  Description
                </button>
                <button 
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'details' ? 'text-brand-dark-blue border-b-2 border-brand-gold bg-brand-dark-blue/5' : 'text-gray-400 hover:text-brand-dark-blue'}`}
                >
                  Details
                </button>
              </div>
              
              <div className="p-6">
                {activeTab === 'description' && (
                  <p className="text-sm text-brand-dark-blue/80 leading-relaxed font-medium whitespace-pre-wrap">
                    {product.description || "No description available."}
                  </p>
                )}
                
                {activeTab === 'details' && (() => {
                  const productDetails = product.details || [];
                  return productDetails.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {productDetails.map((detail, i) => (
                        <div key={i} className="flex items-center py-3 gap-4">
                          <span className="text-xs font-bold text-brand-dark-blue/50 uppercase tracking-wider w-32 shrink-0">{detail.label}</span>
                          <span className="text-sm text-brand-dark-blue font-medium">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm py-2 border-b border-gray-100">
                        <Check className="w-4 h-4 text-brand-gold shrink-0" />
                        <span className="text-brand-dark-blue/80 font-medium">Premium craftsmanship</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm py-2 border-b border-gray-100">
                        <Check className="w-4 h-4 text-brand-gold shrink-0" />
                        <span className="text-brand-dark-blue/80 font-medium">Skin-friendly materials</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm py-2">
                        <Check className="w-4 h-4 text-brand-gold shrink-0" />
                        <span className="text-brand-dark-blue/80 font-medium">Comes in luxury packaging</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Customer Reviews — always visible below tabs */}
            <div className="animate-info bg-white rounded-2xl shadow-sm border border-brand-beige/50 overflow-hidden mt-6">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-brand-dark-blue text-lg">
                  Customer Reviews
                  {reviews.length > 0 && <span className="ml-2 text-brand-gold">({reviews.length})</span>}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((rev, idx) => (
                    <div key={idx} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-dark-blue/10 flex items-center justify-center text-brand-dark-blue">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-brand-dark-blue text-sm">{rev.name}</span>
                        </div>
                        <div className="flex text-brand-gold">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>

                      {(rev.color || rev.size) && (
                        <div className="flex gap-2 mt-1 mb-1">
                          {rev.color && <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold">{rev.color}</span>}
                          {rev.size && <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold">{rev.size}</span>}
                        </div>
                      )}

                      <p className="text-sm text-gray-600 mt-1">{rev.comment}</p>
                      {rev.date && <p className="text-[10px] text-gray-400 mt-1">{new Date(rev.date).toLocaleDateString()}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No reviews yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* People Also Bought Section */}
      {relatedProducts.length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-16 md:mt-24 mb-12">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark-blue">
              People Also Bought
            </h2>
            <button onClick={() => navigate('/category/all')} className="text-sm font-bold text-brand-gold hover:underline hidden md:block">
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(relProduct => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Buy Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-brand-beige p-4 flex gap-3 z-[60] md:hidden pb-safe">
        <button 
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 border-2 font-bold py-3.5 rounded-xl shadow-sm text-sm ${
            isOutOfStock 
              ? 'border-gray-300 text-gray-500 cursor-not-allowed'
              : 'border-brand-dark-blue text-brand-dark-blue'
          }`}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
        <button 
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className={`flex-1 font-bold py-3.5 rounded-xl shadow-md text-sm ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-brand-dark-blue text-brand-gold'
          }`}
        >
          Buy Now
        </button>
      </div>

    </div>
  );
}
