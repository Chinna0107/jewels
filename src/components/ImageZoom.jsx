import React, { useState, useRef } from 'react';

export function ImageZoom({ src, alt, className }) {
  const [position, setPosition] = useState({ x: '50%', y: '50%' });
  const [isZoomed, setIsZoomed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x: `${x}%`, y: `${y}%` });
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`relative overflow-hidden cursor-crosshair md:cursor-zoom-in ${className}`}
        onMouseEnter={() => {
          if (window.matchMedia('(hover: hover)').matches) setIsZoomed(true);
        }}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setIsModalOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-contain transition-opacity duration-200 ${isZoomed ? 'opacity-0' : 'opacity-100'}`}
        />
        {isZoomed && (
          <div
            className="absolute inset-0 pointer-events-none hidden md:block"
            style={{
              backgroundImage: `url(${src})`,
              backgroundPosition: `${position.x} ${position.y}`,
              backgroundSize: '250%',
              backgroundRepeat: 'no-repeat',
              backgroundColor: 'white'
            }}
          />
        )}
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-8 cursor-zoom-out"
          onClick={() => setIsModalOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white p-2 rounded-full transition-colors z-10 bg-black/20 hover:bg-black/40 backdrop-blur-sm"
            onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full max-h-full object-contain cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
