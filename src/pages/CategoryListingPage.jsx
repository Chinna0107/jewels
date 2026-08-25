import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowLeft, Filter, X, ChevronDown, Check } from 'lucide-react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { ProductCard } from '../components/ProductCard';
import { useStoreData } from '../store/useStoreData';
import imgAarti from '../assets/story_aarti.png';
import imgMeditation from '../assets/story_meditation.png';

export function CategoryListingPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [layout, setLayout] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState('featured'); // featured, price_asc, price_desc
  const { products, categories, offers, loading } = useStoreData();
  
  const modelQuery = searchParams.get('model');
  const searchQuery = searchParams.get('search');
  
  // Prevent body scroll when mobile filter is open
  useEffect(() => {
    if (showMobileFilters) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showMobileFilters]);
  
  let categoryName = modelQuery ? `${modelQuery} Products` : 'All Products';
  let bannerImg = imgAarti;
  
  if (categoryId !== 'all') {
    const cat = categories.find(c => c.id.toString() === categoryId);
    if (cat) {
      categoryName = cat.name;
      if (cat.image_url) bannerImg = cat.image_url;
    }
  }
  if (searchQuery) categoryName = `Search: "${searchQuery}"`;

  // Filter products
  let filteredProducts = products.filter(p => {
    let matchCat = true;
    if (categoryId !== 'all' && !searchQuery) {
      const cat = categories.find(c => c.id.toString() === categoryId);
      matchCat = cat ? p.category === cat.name : false;
    }
    
    let matchModel = true;
    if (modelQuery) {
      matchModel = p.model === modelQuery;
    }

    let matchSearch = true;
    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase();
      matchSearch = p.name.toLowerCase().includes(lowerSearch) || 
                    (p.description && p.description.toLowerCase().includes(lowerSearch));
    }

    return matchCat && matchModel && matchSearch;
  });

  const getProductFinalPrice = (product) => {
    const variants = product.variants || [];
    const firstVariant = variants[0] || {};
    const defaultSize = product.sizes?.[0] || firstVariant?.sizes?.[0] || { price: product.price };
    let originalPrice = Number(defaultSize.mrp) || Number(defaultSize.price) || 0;
    let displayPrice = Number(defaultSize.our_price) || originalPrice;
    let activeOffer = null;
    if (defaultSize.offer_id) {
      activeOffer = offers?.find(o => o.id == defaultSize.offer_id && o.is_active);
    } else if (product.offer_id) {
      activeOffer = offers?.find(o => o.id === product.offer_id && o.is_active);
    }
    if (activeOffer) {
      displayPrice = Math.round(originalPrice - (originalPrice * (activeOffer.discount_percentage / 100)));
    }
    console.log("PRICE for", product.name, product.id, "is", displayPrice); return displayPrice;
  };

  let flattenedProducts = filteredProducts.flatMap(product => {
    if (product.variants && product.variants.length > 1) {
      return product.variants.map((variant, idx) => ({
        ...product,
        uniqueListId: `${product.id}-${variant.code || idx}`,
        variants: [variant]
      }));
    }
    return [{ ...product, uniqueListId: product.id }];
  });

  // Sort flattened products
  if (sortBy === 'price_asc') {
    flattenedProducts.sort((a, b) => getProductFinalPrice(a) - getProductFinalPrice(b));
  } else if (sortBy === 'price_desc') {
    flattenedProducts.sort((a, b) => getProductFinalPrice(b) - getProductFinalPrice(a));
  }

  const handleCategoryChange = (newCatId) => {
    // Clear subcategory when changing category
    setSearchParams({});
    navigate(`/category/${newCatId}`);
    setShowMobileFilters(false);
  };

  const handleModelChange = (model) => {
    if (model) {
      setSearchParams({ model });
    } else {
      setSearchParams({});
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    // Don't close immediately on sort change so they can apply multiple, but closing on sort is fine for a simpler UX
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDF8F0]">
        <div className="w-8 h-8 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  const currentCat = categories.find(c => c.id.toString() === categoryId);
  const currentModels = currentCat ? (currentCat.models || []) : [];

  const FilterSidebarContent = () => (
    <div className="flex flex-col gap-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-bold text-[#08183A] mb-3 uppercase tracking-wider">Categories</h3>
        <ul className="space-y-1">
          <li>
            <button 
              onClick={() => handleCategoryChange('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryId === 'all' ? 'bg-[#08183A]/10 text-[#D4AF37] font-bold' : 'text-[#08183A]/70 hover:bg-gray-100'}`}
            >
              All Products
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat.id}>
              <button 
                onClick={() => handleCategoryChange(cat.id.toString())}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryId === cat.id.toString() ? 'bg-[#08183A]/10 text-[#D4AF37] font-bold' : 'text-[#08183A]/70 hover:bg-gray-100'}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Subcategories (Models) */}
      {currentModels.length > 0 && (
        <div className="border-t border-[#D4AF37]/20 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#08183A] uppercase tracking-wider">Subcategories</h3>
            {modelQuery && (
              <button onClick={() => handleModelChange('')} className="text-[10px] text-[#D4AF37] hover:underline font-bold">Clear</button>
            )}
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {currentModels.map(model => (
              <label key={model} className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${modelQuery === model ? 'border-[#D4AF37] bg-[#08183A]' : 'border-gray-300 group-hover:border-[#D4AF37]'}`}>
                  {modelQuery === model && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm ${modelQuery === model ? 'text-[#D4AF37] font-bold' : 'text-[#08183A]/70'}`}>{model}</span>
                <input type="radio" name="model_radio" className="hidden" checked={modelQuery === model} onChange={() => handleModelChange(model)} />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Sort By */}
      <div className="border-t border-[#D4AF37]/20 pt-6">
        <h3 className="text-sm font-bold text-[#08183A] mb-3 uppercase tracking-wider">Sort By</h3>
        <div className="space-y-2">
          {[
            { id: 'featured', label: 'Featured' },
            { id: 'price_asc', label: 'Price: Low to High' },
            { id: 'price_desc', label: 'Price: High to Low' },
          ].map(opt => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${sortBy === opt.id ? 'border-[#D4AF37] bg-[#08183A]' : 'border-gray-300 group-hover:border-[#D4AF37]'}`}>
                {sortBy === opt.id && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm ${sortBy === opt.id ? 'text-[#D4AF37] font-bold' : 'text-[#08183A]/70'}`}>{opt.label}</span>
              <input type="radio" name="sort_radio" className="hidden" checked={sortBy === opt.id} onChange={() => handleSortChange(opt.id)} />
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#FDF8F0] min-h-screen pb-20">
      <Header title={categoryName} showShare={true} />
      
      {/* Category Banner */}
      <div className="w-full bg-[#08183A]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between p-6 md:px-12 md:py-8 gap-6">
          <div className="text-center md:text-left text-white max-w-xl">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3 tracking-wide">{categoryName}</h1>
            <p className="text-white/80 font-sans text-sm md:text-base leading-relaxed">
              Discover our curated collection of timeless fashion jewellery, crafted to add elegance, sparkle, and sophistication to every occasion. ✨
            </p>
          </div>
          <div className="w-24 h-24 md:w-36 md:h-36 shrink-0 rounded-full bg-white/10 p-2 border border-white/20 backdrop-blur-md hidden md:block">
            <img src={bannerImg} alt={categoryName} className="w-full h-full object-cover rounded-full mix-blend-multiply opacity-80" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        
        {/* Filter and Sort Bar for Mobile / Top Bar for Desktop */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 bg-white p-3 md:p-4 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#D4AF37]/20 gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <span className="text-sm font-bold text-[#08183A] bg-[#D4AF37]/10 px-3 py-1.5 rounded-lg">{filteredProducts.length} Items</span>
            
            {/* Mobile Filter Trigger */}
            <button 
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-1.5 text-sm font-bold text-[#D4AF37] bg-[#08183A]/10 px-4 py-1.5 rounded-lg"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <span className="text-sm font-semibold text-[#08183A]/60">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setLayout('grid')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${layout === 'grid' ? 'bg-white shadow-sm text-[#D4AF37]' : 'text-gray-500 hover:text-gray-900'}`}>Grid</button>
              <button onClick={() => setLayout('list')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${layout === 'list' ? 'bg-white shadow-sm text-[#D4AF37]' : 'text-gray-500 hover:text-gray-900'}`}>List</button>
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#D4AF37]/20 sticky top-24">
            <FilterSidebarContent />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className={layout === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6' : 'flex flex-col gap-4'}>
              {flattenedProducts.map(product => (
                <ProductCard key={product.uniqueListId} product={product} layout={layout} />
              ))}
              
              {flattenedProducts.length === 0 && (
                <div className="col-span-full py-20 text-center flex flex-col items-center bg-white rounded-2xl shadow-sm border border-[#D4AF37]/5">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Search className="w-6 h-6 text-[#D4AF37]/50" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#08183A] mb-1">No products found</h3>
                  <p className="text-sm text-[#08183A]/60 max-w-md">Try adjusting your filters or search terms to find what you're looking for.</p>
                  <button onClick={() => { handleCategoryChange('all'); setSortBy('featured'); }} className="mt-6 text-[#D4AF37] font-bold text-sm bg-[#08183A]/10 px-6 py-2 rounded-full hover:bg-[#08183A]/20 transition-colors">
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer/Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[60] lg:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowMobileFilters(false)} />
          <div className="relative ml-auto w-[85%] max-w-sm bg-white h-full flex flex-col shadow-2xl transition-transform transform translate-x-0">
            <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/20">
              <h2 className="font-serif text-xl font-bold text-[#08183A] flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#D4AF37]" /> Filters
              </h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <FilterSidebarContent />
            </div>
            
            <div className="p-5 border-t border-[#D4AF37]/20 bg-gray-50 flex gap-3">
              <button 
                onClick={() => { handleCategoryChange('all'); setSortBy('featured'); setShowMobileFilters(false); }}
                className="flex-1 px-4 py-3 border border-[#D4AF37]/20 text-[#08183A] font-bold rounded-xl bg-white shadow-sm"
              >
                Reset
              </button>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="flex-[2] px-4 py-3 bg-[#08183A] text-white font-bold rounded-xl shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
}
