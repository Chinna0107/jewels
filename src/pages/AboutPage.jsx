import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/Header';

export function AboutPage() {
  const slideshowImages = [
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80",
    "https://img.magnific.com/free-photo/top-view-gold-chain-jewellery_52683-90080.jpg?semt=ais_hybrid&w=740&q=80"
  ];
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  const handleNextImage = () => {
    setCurrentImgIdx((prev) => (prev + 1) % slideshowImages.length);
  };

  return (
    <div className="bg-brand-beige min-h-screen pb-20 md:pb-12 font-sans">
      <Header title="Our Story" />
      
      <div className="px-4 md:px-24 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-brand-gold/20 rounded-[32px] transform -rotate-3 z-0"></div>
            <div 
              className="relative rounded-[24px] overflow-hidden shadow-2xl border border-brand-gold/30 aspect-[4/5] z-10 cursor-pointer group"
              onClick={handleNextImage}
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentImgIdx}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  src={slideshowImages[currentImgIdx]} 
                  alt="Premium Gold Jewelry" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-blue/90 via-brand-dark-blue/20 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-10 left-10 right-10 pointer-events-none">
                <h3 className="text-brand-gold font-serif text-3xl mb-2">Elegant & Timeless</h3>
                <p className="text-white/90 text-sm md:text-base mb-4">Crafted for the modern aesthetic.</p>
                <div className="flex gap-2">
                  {slideshowImages.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImgIdx ? 'w-6 bg-brand-gold' : 'w-2 bg-white/40'}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Content Section */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col justify-center space-y-8"
          >
            <div>
              <h4 className="text-brand-gold font-bold tracking-widest uppercase text-xs md:text-sm mb-3">About Houra Jewels</h4>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-brand-dark-blue leading-tight mb-6">
                Redefining Everyday Luxury
              </h1>
              <div className="w-20 h-1.5 bg-brand-gold mb-8 rounded-full"></div>
            </div>
            
            <div className="space-y-6 text-brand-dark-blue/80 text-base md:text-lg leading-relaxed">
              <p className="first-letter:text-6xl first-letter:font-serif first-letter:text-brand-gold first-letter:mr-2 first-letter:float-left">
                Welcome to <strong className="text-brand-dark-blue font-semibold">Houra Jewels</strong>, your premium destination for exquisite fashion jewelry. Operating as an exclusive home-based retail boutique, we are passionate about bringing you high-quality accessories that blend seamlessly into your daily life.
              </p>
              
              <p>
                We specialize in premium <strong className="text-brand-dark-blue font-semibold">Stainless Steel 18K PVD Gold Plated</strong> jewelry. Our carefully curated collections are purposefully designed to be <strong className="text-brand-dark-blue font-semibold">Waterproof, Tarnish-Free, and perfectly suited for Daily Wear</strong>. You no longer have to compromise between elegance and durability.
              </p>
              
              <p>
                While our collections predominantly cater to women who seek timeless elegance, we also offer an exclusive selection of men's jewelry. Every piece we offer is a testament to our commitment to quality, ensuring that your favorite accessories remain as vibrant and radiant as the day you first wore them.
              </p>
            </div>
            
            <div className="pt-8 border-t border-brand-gold/20">
              <p className="font-serif italic text-2xl md:text-3xl text-brand-dark-blue">
                "Waterproof. Tarnish Free. Made for your Everyday."
              </p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Trust & Quality Section */}
      <div className="bg-white py-16 md:py-24">
        <div className="px-4 md:px-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark-blue mb-4">The Houra Promise</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We are committed to providing you with premium, skin-safe, and durable jewelry that you can trust every single day.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-brand-beige p-8 rounded-2xl border border-brand-gold/10 text-center hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 mx-auto bg-brand-dark-blue rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-brand-dark-blue text-xl mb-3">100% Hypoallergenic</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Our stainless steel core is completely skin-safe, lead-free, and nickel-free. Perfect for sensitive skin.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-brand-beige p-8 rounded-2xl border border-brand-gold/10 text-center hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 mx-auto bg-brand-dark-blue rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-brand-dark-blue text-xl mb-3">Premium Stainless Steel Plating</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Advanced PVD (Physical Vapor Deposition) technology ensures our 18K gold finish lasts 10x longer than standard plating.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-brand-beige p-8 rounded-2xl border border-brand-gold/10 text-center hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 mx-auto bg-brand-dark-blue rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-bold text-brand-dark-blue text-xl mb-3">Certified Quality</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Shop with absolute confidence. Every piece is rigorously inspected to meet our strict quality and durability standards.</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Secondary Story Section */}
      <div className="px-4 md:px-24 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark-blue mb-6">Crafted for Real Life</h2>
            <div className="w-16 h-1 bg-brand-gold mb-8 rounded-full"></div>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              We started Houra Jewels because we were tired of buying beautiful jewelry that turned green after a few washes, or tarnished within a month. 
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              By utilizing medical-grade stainless steel paired with a PVD gold-plating method, we created a lineup of ethical, skin-safe accessories that you can wear in the shower, at the gym, and to sleep without a second thought.
            </p>
            <ul className="space-y-3 mt-8">
              {['Water, Sweat & Heat Resistant', 'Zero Green Skin Guarantee', 'Sustainable & Ethical Production', 'Secure, Fast Shipping'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-brand-dark-blue font-semibold">
                  <svg className="w-5 h-5 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <img src="https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Gold Rings" className="w-full rounded-2xl shadow-lg border border-brand-gold/20" />
              </div>
              <div className="space-y-4">
                <img src="https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Wearing Jewelry" className="w-full rounded-2xl shadow-lg border border-brand-gold/20" />
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-brand-beige">
              <span className="font-serif font-bold text-brand-dark-blue text-center leading-tight">100%<br/><span className="text-brand-gold text-xs">GUARANTEED</span></span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
