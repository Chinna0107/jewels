import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Heart, ShoppingCart, Star, ShieldCheck, Truck, RefreshCcw, Settings, Check, ChevronRight } from 'lucide-react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useStoreData } from '../store/useStoreData';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useStoreData();
  const product = products.find(p => p.id.toString() === id);
  const { addToCart } = useCartStore();
  const { toggleWishlist, items: wishlistItems } = useWishlistStore();
  
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const isWishlisted = product ? wishlistItems.includes(product.id) : false;
  
  const { offers } = useStoreData();
  const activeOffer = product?.offer_id ? offers?.find(o => o.id === product.offer_id && o.is_active) : null;
  
  const container = useRef(null);

  const productImages = product ? ((product.images && product.images.length > 0) 
    ? product.images 
    : (product.image_url ? [product.image_url] : [])) : [];
    
  const [mainImg, setMainImg] = useState(null);

  // Determine Related Products
  const relatedProducts = product ? products.filter(p => p.category_id === product.category_id && p.id !== product.id).slice(0, 4) : [];

  useEffect(() => {
    // Reset state when ID changes
    setMainImg(null);
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (productImages.length > 0 && !mainImg) {
      setMainImg(productImages[0]);
    }
  }, [productImages, mainImg]);

  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product, selectedSize]);

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
    const size = selectedSize || { size: 'Standard', price: 0 };
    addToCart(product, { ...size, price: getDisplayPrice(size.price) }, quantity);
  };

  const handleBuyNow = () => {
    const size = selectedSize || { size: 'Standard', price: 0 };
    addToCart(product, { ...size, price: getDisplayPrice(size.price) }, quantity);
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
            {/* Main Image */}
            <div className="w-full aspect-square relative rounded-2xl overflow-hidden shadow-sm">
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
              <img 
                src={mainImg || productImages[0]} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            
            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto hide-scrollbar mt-4">
                {productImages.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setMainImg(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all ${mainImg === img ? 'border-2 border-brand-dark-blue shadow-sm' : 'border-2 border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info & Actions */}
          <div className="md:col-span-7 space-y-8 pb-8">
            
            {/* Header Info */}
            <div className="animate-info space-y-1">
              <h1 className="text-3xl md:text-[40px] font-serif font-bold text-brand-dark-blue leading-tight">
                {product.name}
              </h1>
              {product.color && (
                <p className="text-brand-dark-blue/70 font-medium text-lg">{product.color}</p>
              )}
            </div>

            <div className="animate-info">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-bold text-brand-dark-blue">
                  ${selectedSize ? getDisplayPrice(selectedSize.price).toLocaleString() : getDisplayPrice(product.sizes?.[0]?.price || 0).toLocaleString()}
                </span>
                {activeOffer && (
                  <span className="text-xl md:text-2xl font-bold text-gray-400 line-through">
                    ${selectedSize ? selectedSize.price.toLocaleString() : (product.sizes?.[0]?.price || 0).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-brand-dark-blue/60 text-sm font-medium mt-1">Inclusive of all taxes</p>
            </div>

            <div className="animate-info">
              <h3 className="font-bold text-brand-dark-blue text-lg mb-2">About this product</h3>
              <p className="text-brand-dark-blue/70 leading-relaxed font-medium">
                {product.description || "Beautifully crafted jewelry piece, perfect for any occasion. Made with premium materials to ensure lasting elegance and durability."}
              </p>
            </div>

            {/* Selection Options */}
            <div className="animate-info space-y-6">
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="font-bold text-brand-dark-blue text-lg mb-3">Select Size</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {product.sizes.map((sizeObj, idx) => {
                      const isSelected = selectedSize?.size === sizeObj.size;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedSize(sizeObj)}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${
                            isSelected 
                              ? 'border-brand-dark-blue bg-brand-dark-blue/5' 
                              : 'border-brand-dark-blue/10 bg-transparent hover:border-brand-dark-blue/30'
                          }`}
                        >
                          <span className={`font-bold text-base ${isSelected ? 'text-brand-dark-blue' : 'text-brand-dark-blue/80'}`}>{sizeObj.size}</span>
                          <span className={`font-bold mt-1 ${isSelected ? 'text-brand-gold' : 'text-brand-dark-blue/50'}`}>${sizeObj.price}</span>
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
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-xl bg-white text-brand-dark-blue font-bold text-xl flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors border border-gray-100">-</button>
                  <span className="w-12 text-center font-bold text-brand-dark-blue text-xl">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 rounded-xl bg-white text-brand-dark-blue font-bold text-xl flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors border border-gray-100">+</button>
                </div>
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="animate-info hidden md:flex items-center gap-4 pt-4">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-brand-dark-blue text-brand-gold font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-dark-blue/90 shadow-md shadow-brand-dark-blue/20 transition-all text-lg"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
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
            <div className="animate-info bg-white rounded-2xl shadow-sm border border-brand-beige/50 overflow-hidden">
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
                    {product.description}
                  </p>
                )}
                {activeTab === 'details' && (
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-brand-gold" />
                      <span className="text-brand-dark-blue/80 font-medium">Premium craftsmanship</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-brand-gold" />
                      <span className="text-brand-dark-blue/80 font-medium">Skin-friendly materials</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-brand-gold" />
                      <span className="text-brand-dark-blue/80 font-medium">Comes in luxury packaging</span>
                    </li>
                  </ul>
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
          className="flex-1 border-2 border-brand-dark-blue text-brand-dark-blue font-bold py-3.5 rounded-xl shadow-sm text-sm"
        >
          Add to Cart
        </button>
        <button 
          onClick={handleBuyNow}
          className="flex-1 bg-brand-dark-blue text-brand-gold font-bold py-3.5 rounded-xl shadow-md text-sm"
        >
          Buy Now
        </button>
      </div>

    </div>
  );
}
