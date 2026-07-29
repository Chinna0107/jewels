import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Share2 } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { useStoreData } from '../store/useStoreData';

export function ProductCard({ product, layout = 'grid' }) {
  const navigate = useNavigate();
  const { toggleWishlist, items: wishlistItems } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { offers } = useStoreData();

  const isWishlisted = wishlistItems.includes(product.id);

  // Fallback for older product structure
  let variants = product.variants;
  if (!variants || variants.length === 0) {
    variants = [{
      color: product.color || "",
      images: product.images || (product.image_url ? [product.image_url] : []),
      sizes: product.sizes ? product.sizes.map(s => ({ size: s.size, mrp: s.price, our_price: s.price })) : []
    }];
  }

  const firstVariant = variants[0] || { color: "", images: [], sizes: [] };
  const firstImg = firstVariant.images && firstVariant.images.length > 0 ? firstVariant.images[0] : "";
  const defaultSize = firstVariant.sizes && firstVariant.sizes.length > 0 ? firstVariant.sizes[0] : { size: 'Standard', mrp: 0, our_price: 0 };
  
  const originalPrice = Number(defaultSize.mrp) || Number(defaultSize.our_price) || 0;
  let displayPrice = Number(defaultSize.our_price) || originalPrice;

  // Calculate offer price
  let activeOffer = null;
  if (product.offer_id) {
    activeOffer = offers?.find(o => o.id === product.offer_id && o.is_active);
    if (activeOffer) {
      displayPrice = Math.round(originalPrice - (originalPrice * (activeOffer.discount_percentage / 100)));
    }
  }

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/product/${product.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, { ...defaultSize, price: displayPrice }, 1, firstVariant.color);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  // Determine reviews average
  let avgRating = 4.5;
  let reviewCount = 12; // default mock
  if (product.reviews && product.reviews.length > 0) {
    const total = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    avgRating = (total / product.reviews.length).toFixed(1);
    reviewCount = product.reviews.length;
  }

  if (layout === 'list') {
    return (
      <Link to={`/product/${product.id}`} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm mb-4 relative hover:shadow-md transition-shadow">
        <div className="w-24 h-24 bg-white rounded-lg flex-shrink-0 p-2 relative border border-[#08183A]/10">
          <img src={firstImg} alt={product.name} className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col justify-center flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1">{product.name}</h3>
            {product.product_code && (
               <span className="text-[9px] text-gray-400 font-mono ml-2 shrink-0">{product.product_code}</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
            <span className="text-[10px] font-medium text-gray-500">{avgRating} ({reviewCount})</span>
            {variants.length > 1 && (
              <>
                <span className="text-[10px] font-medium text-gray-300 px-1">•</span>
                <span className="text-[10px] font-medium text-brand-dark-blue">{variants.length} Colors</span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-gray-900">${displayPrice}</span>
              {(activeOffer || originalPrice > displayPrice) && (
                <span className="text-[10px] text-gray-400 line-through">${originalPrice}</span>
              )}
              <span className="text-[9px] text-[#08183A] font-bold bg-[#08183A]/10 px-1 py-0.5 rounded">{defaultSize.size}</span>
            </div>
            <button onClick={handleAddToCart} className="bg-[#08183A] text-white text-xs font-semibold px-4 py-1.5 rounded-md hover:bg-[#D4AF37] transition-colors flex items-center gap-1">
              <ShoppingCart className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button 
            onClick={handleWishlist}
            className="p-1.5 bg-white/80 rounded-full shadow-sm text-gray-300 hover:scale-110 transition-transform"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#08183A] text-[#08183A]' : 'text-gray-400'}`} />
          </button>
          <button 
            onClick={handleShare}
            className="p-1.5 bg-white/80 rounded-full shadow-sm text-gray-400 hover:scale-110 transition-transform"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </Link>
    );
  }

  return (
    <div 
      onClick={handleCardClick}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#08183A]/10 cursor-pointer transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 h-full p-3 relative"
    >
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button onClick={handleWishlist} className="p-1.5 hover:scale-110 transition-transform bg-white/90 rounded-full shadow-sm">
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#08183A] text-[#08183A]' : 'text-gray-400'}`} />
        </button>
        <button onClick={handleShare} className="p-1.5 hover:scale-110 transition-transform bg-white/90 rounded-full shadow-sm">
          <Share2 className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="relative aspect-square bg-gray-50 overflow-hidden rounded-xl mb-3">
        {activeOffer && (
          <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            {activeOffer.discount_percentage}% OFF
          </div>
        )}
        {firstImg ? (
          <img src={firstImg} alt={product.name} className="w-full h-full object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}
      </div>

      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{product.name}</h3>
        </div>
        {product.product_code && (
           <div className="text-[10px] text-gray-400 font-mono mb-1">{product.product_code}</div>
        )}
        
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
          <span className="text-[10px] font-medium text-gray-500">{avgRating} ({reviewCount})</span>
          {variants.length > 1 ? (
             <>
               <span className="text-[10px] font-medium text-gray-300 px-1">•</span>
               <span className="text-[10px] font-medium text-brand-dark-blue">{variants.length} Colors</span>
             </>
          ) : firstVariant.color && (
            <>
              <span className="text-[10px] font-medium text-gray-300 px-1">•</span>
              <span className="text-[10px] font-medium text-gray-500 line-clamp-1">{firstVariant.color}</span>
            </>
          )}
        </div>

        <div className="flex items-end justify-between mt-auto mb-1">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-[#08183A] font-bold bg-[#08183A]/10 px-1.5 py-0.5 rounded w-fit">{defaultSize.size}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-gray-900 leading-none">${displayPrice}</span>
              {(activeOffer || originalPrice > displayPrice) && (
                <span className="text-[10px] text-gray-400 line-through leading-none">${originalPrice}</span>
              )}
            </div>
          </div>

          <button onClick={handleAddToCart} className="bg-[#08183A] text-white p-2.5 rounded-full hover:bg-[#D4AF37] transition-all hover:shadow-md hover:scale-105 shrink-0 flex items-center justify-center group/btn">
            <ShoppingCart className="w-4 h-4 hidden group-hover/btn:block" />
            <span className="text-sm font-bold leading-none w-4 h-4 flex items-center justify-center group-hover/btn:hidden">+</span>
          </button>
        </div>
      </div>
    </div>
  );
}
