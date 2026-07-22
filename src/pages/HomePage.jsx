import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Star, Flame, Sparkles, Circle, Gift, Wind, Bell, Droplet, Flower2, Cloud, Grid } from 'lucide-react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { useStoreData } from '../store/useStoreData';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import imgHeroBanner from '../assets/hero_banner.png';
import bannerJewelry from '../assets/banner_jewelry.jpg';
import imgMeditation from '../assets/story_meditation.png';
import imgAarti from '../assets/story_aarti.png';

export function HomePage() {
  const container = useRef(null);
  const { products, categories, loading } = useStoreData();
  const [banners, setBanners] = React.useState([]);
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
    fetch(`${url}/general/banners`)
      .then(r => r.json())
      .then(d => { if (d.banners) setBanners(d.banners); })
      .catch(e => console.error(e));
  }, []);

  React.useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);
  useGSAP(() => {
    if (!loading) {
      gsap.from('.animate-section', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        clearProps: 'all'
      });
    }
  }, { scope: container, dependencies: [loading] });

  const featuredProducts = products.slice(0, 5);

  return (
    <div ref={container} className="bg-brand-beige flex-grow w-full flex flex-col pb-8">
      <Header variant="home" />

      {/* Hero Banner Section */}
      <div className="animate-section py-4 md:py-8">
        {banners.length > 0 ? (
          <div className="relative w-full md:w-[75%] h-48 md:h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-100 mx-auto px-4 md:px-0">
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {banners.map((banner) => (
                <div key={banner.id} className="relative w-full h-full shrink-0">
                  <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-center px-6 md:px-16">
                    <h2 className="text-white text-2xl md:text-5xl font-bold mb-4 leading-tight font-serif tracking-wide drop-shadow-lg">
                      {banner.title}
                    </h2>
                    {(banner.link_url || banner.link_url === '') && (
                      <Link to={banner.link_url || "/category/all"} className="bg-brand-dark-blue text-brand-gold text-xs md:text-base font-bold px-8 py-3 md:py-4 rounded-xl w-fit shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                        SHOP NOW
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Slider Dots */}
            <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 md:h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white w-6 md:w-8' : 'bg-white/50 w-1.5 md:w-2 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center px-4 md:px-24 pt-2 md:pt-6 pb-2">
            <div className="relative w-full h-72 md:h-[360px] rounded-[24px] overflow-hidden shadow-2xl border border-brand-gold/20 bg-brand-beige group">
              <div className="absolute inset-0 z-0">
                <img src="https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Jewelry Collection" className="w-full h-full object-cover object-right transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#FDF8F0] via-[#FDF8F0]/95 to-[#FDF8F0]/0 z-10 pointer-events-none w-full md:w-[80%]"></div>
              </div>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 z-10 w-[70%]">
                <h2 className="text-[#08183A] text-2xl md:text-4xl lg:text-[40px] font-bold mb-3 md:mb-4 leading-[1.2] font-serif tracking-wide drop-shadow-sm">
                  Timeless Elegance,<br />
                  <span className="text-[#08183A]/80 font-light">Made for You</span>
                </h2>
                <p className="text-gray-600 text-xs md:text-sm lg:text-[15px] mb-6 md:mb-8 max-w-[280px] md:max-w-sm leading-relaxed">
                  Discover our exquisite collection crafted to perfection.
                </p>
                <Link to="/category/all" className="bg-[#08183A] text-white text-[11px] md:text-xs font-bold px-6 py-3 md:px-8 md:py-3.5 rounded-xl w-fit shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all hover:bg-[#D4AF37] tracking-wider uppercase">
                  SHOP NOW
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="md:max-w-full mx-auto w-full pb-20">
        {/* Categories Grid */}
        <div className="animate-section px-4 md:px-24 mb-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-xl md:text-2xl text-gray-900">Shop by Category</h3>
            <Link to="/category/all" className="text-sm font-semibold text-brand-accent flex items-center gap-1">View All <span className="text-lg leading-none">&rsaquo;</span></Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-6 gap-x-3">
            {categories.map((cat) => {
              const IconMap = {
                Flame,
                Sparkles,
                Circle,
                Gift,
                Wind,
                Bell,
                Droplet,
                Flower2,
                Cloud,
                Grid
              };
              const Icon = IconMap[cat.icon] || Star;

              return (
                <Link key={cat.id} to={`/category/${cat.id}`} className="group flex flex-col h-full rounded-[14px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-brand-beige-darker border border-brand-gold/30">
                  <div className="h-24 md:h-32 w-full flex items-center justify-center relative overflow-hidden bg-white/50">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    ) : (
                      <Star className="w-8 h-8 text-brand-gold" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="bg-brand-dark-blue flex items-center justify-center gap-1.5 py-2.5 md:py-3 px-2 mt-auto border-t border-brand-gold/20">
                    <Sparkles className="w-3 h-3 text-brand-gold shrink-0" />
                    <span className="text-[10px] md:text-xs font-semibold text-white text-center leading-tight truncate">{cat.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Trending Products */}
        {products.filter(p => p.is_trending).length > 0 && (
          <div className="animate-section mb-8">
            <div className="flex justify-between items-center mb-4 px-4 md:px-24">
              <h3 className="font-bold text-gray-900">Trending Products</h3>
              <Link to="/category/all" className="text-xs font-semibold text-brand-orange">View all</Link>
            </div>

            <div className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:px-24 pb-2 md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible">
              {products.filter(p => p.is_trending).slice(0, 5).map(product => (
                <div key={product.id} className="w-[140px] md:w-auto shrink-0 hover:-translate-y-1 transition-transform">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Offers / Premium Collection Banner */}
        <div className="animate-section px-4 md:px-24 mb-12 flex justify-center mt-8">
          <div className="relative w-full h-32 md:h-[300px] rounded-[24px] overflow-hidden shadow-lg border border-brand-gold/20 group">
            <div className="absolute inset-0 z-0">
              <img src="https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Jewelry Offers" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-dark-blue via-brand-dark-blue/90 to-brand-dark-blue/0 z-10 pointer-events-none w-full md:w-[70%]"></div>
            </div>
            
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-12 pointer-events-none">
              <div className="bg-brand-gold text-brand-dark-blue text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-3 drop-shadow-sm pointer-events-auto">Today's Offers</div>
              <h2 className="text-white text-xl md:text-4xl font-bold mb-4 leading-tight font-serif drop-shadow-md">
                Get up to 50% OFF<br />on Diamond Collections
              </h2>
              <Link to="/category/all" className="bg-brand-gold text-brand-dark-blue text-[10px] md:text-sm font-bold px-6 py-2.5 md:px-8 md:py-3 rounded-xl w-fit hover:bg-white hover:scale-105 shadow-lg shadow-brand-gold/20 transition-all pointer-events-auto">
                SHOP OFFERS
              </Link>
            </div>
          </div>
        </div>

        {/* Festive Collection */}
        {products.filter(p => p.is_festive).length > 0 && (
          <div className="animate-section mb-8 px-4 md:px-24">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Festive Collection</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
              {products.filter(p => p.is_festive).slice(0, 5).map(product => (
                <div key={product.id} className="hover:-translate-y-1 transition-transform">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offers Section */}
        {products.filter(p => p.is_offer).length > 0 && (
          <div className="animate-section mb-8 px-4 md:px-24">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Special Offers</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
              {products.filter(p => p.is_offer).slice(0, 5).map(product => (
                <div key={product.id} className="hover:-translate-y-1 transition-transform">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Sellers */}
        {products.filter(p => p.is_bestseller).length > 0 && (
          <div className="animate-section mb-8 px-4 md:px-24">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Best Sellers</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
              {products.filter(p => p.is_bestseller).slice(0, 5).map(product => (
                <div key={product.id} className="hover:-translate-y-1 transition-transform">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews */}
        <section className="px-4 md:px-24 mb-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif font-bold text-2xl text-brand-dark-blue">What Our Clients Say</h3>
            <span className="text-xs font-semibold text-brand-gold cursor-pointer hover:underline">View all reviews</span>
          </div>
          
          <div className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar pb-6 px-1">
            {[
              { name: 'Priya Sharma', initial: 'P', text: 'The diamond set I purchased is absolutely breathtaking. The craftsmanship is flawless, and it arrived in a beautiful premium box.', rating: 5 },
              { name: 'Ananya Reddy', initial: 'A', text: 'I wore the Kundan necklace for my wedding, and everyone was mesmerized. Truly elegant and timeless pieces!', rating: 5 },
              { name: 'Neha Gupta', initial: 'N', text: 'Excellent customer service and secure packaging. The bracelets are even more gorgeous in person than on the website.', rating: 5 },
              { name: 'Kavya Singh', initial: 'K', text: 'I love their daily wear collection. Minimalist, chic, and very durable. Highly recommend Houra Jewels for any occasion.', rating: 4 },
            ].map((rev, idx) => (
              <div key={idx} className="w-[280px] md:w-[350px] shrink-0 bg-white border border-brand-gold/20 p-6 rounded-[20px] shadow-sm hover:shadow-xl transition-all duration-300 relative group">
                <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" className="text-brand-dark-blue">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-brand-dark-blue text-brand-gold flex items-center justify-center font-bold text-lg shadow-inner">
                    {rev.initial}
                  </div>
                  <div>
                    <span className="block font-bold text-brand-dark-blue">{rev.name}</span>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-brand-gold text-brand-gold' : 'fill-gray-200 text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-brand-dark-blue/80 italic leading-relaxed relative z-10">
                  "{rev.text}"
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>

    </div>
  );
}
