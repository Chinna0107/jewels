import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Menu, Search, Heart, ShoppingCart, ArrowLeft, Share2,
  User, LogIn, Package, MapPin, LayoutDashboard, LogOut,
  Settings, Shield, ChevronDown, X
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';
import image from '../assets/image.png';

function AvatarDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const items = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'My Orders', path: '/my-orders' },
    { icon: MapPin, label: 'My Addresses', path: '/my-addresses' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: Settings, label: 'Account Settings', path: '/account-settings' },
    ...(user?.role === 'admin' ? [{ icon: Shield, label: 'Admin Panel', path: '/admin' }] : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 group">
        <div className="w-8 h-8 rounded-full bg-brand-orange text-white text-xs font-bold flex items-center justify-center shadow-sm ring-2 ring-orange-200 group-hover:ring-orange-400 transition-all">
          {initials}
        </div>
        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform hidden md:block ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[100]">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
            <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
          </div>

          {items.map(({ icon: Icon, label, path }) => (
            <button key={path} onClick={() => { navigate(path); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand-orange transition-colors text-left">
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}

          <div className="border-t border-gray-100 mt-1">
            <button onClick={() => { onLogout(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DesktopFullHeader({ cartCount, wishlistCount, token, user, handleLogout }) {
  return (
    <>
      <div className="h-[76px] hidden md:block" />
      <header className="fixed top-0 left-0 z-50 w-full bg-brand-dark-blue px-4 md:px-12 lg:px-20 py-3 shadow-md border-b border-white/10 hidden md:block">
        <div className="w-full mx-auto flex items-center justify-between">

          <Link to="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity">
            {/* Cropped Bird Icon */}
            <div className="w-[52px] h-[52px] overflow-hidden flex items-start justify-center shrink-0">
              <img src={image} alt="Icon" className="w-[170%] max-w-none h-auto object-cover object-top -mt-2.5" />
            </div>
            {/* Text */}
            <div className="flex flex-col text-left mt-1">
              <span className="font-serif font-bold text-lg leading-none tracking-[0.12em] text-brand-gold whitespace-nowrap">HOURA JEWELS</span>
              <span className="text-white text-[10px] tracking-[0.2em] mt-1.5 uppercase font-medium">By S & M</span>
            </div>
          </Link>

          {/* Desktop Nav & Search */}
          <div className="flex-1 flex items-center justify-end md:justify-center px-4 lg:px-12 gap-8">
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-gray-200 hover:text-brand-gold transition-colors">Home</Link>
              <Link to="/category/all" className="text-sm font-medium text-gray-200 hover:text-brand-gold transition-colors">Categories</Link>
              <Link to="/about" className="text-sm font-medium text-gray-200 hover:text-brand-gold transition-colors">About</Link>
              <Link to="/contact" className="text-sm font-medium text-gray-200 hover:text-brand-gold transition-colors">Contact</Link>
            </nav>
            <div className="relative w-[280px] xl:w-[320px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    window.location.href = `/category/all?search=${encodeURIComponent(e.target.value.trim())}`;
                  }
                }}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-full py-2 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold focus:bg-white/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/wishlist" className="relative p-1 cursor-pointer hover:-translate-y-0.5 transition-transform">
              <Heart className="w-5 h-5 text-white" strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-gold text-brand-dark-blue text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-brand-dark-blue">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-1 cursor-pointer hover:-translate-y-0.5 transition-transform">
              <ShoppingCart className="w-5 h-5 text-white" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-gold text-brand-dark-blue text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-brand-dark-blue">
                  {cartCount}
                </span>
              )}
            </Link>
            {token ? (
              <AvatarDropdown user={user} onLogout={handleLogout} />
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 text-xs font-bold text-brand-dark-blue bg-brand-gold px-4 py-2 rounded-lg hover:bg-brand-gold/80 transition-colors ml-2">
                <LogIn className="w-3.5 h-3.5" /> Login
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export function Header({ variant = 'default', title, showShare = false }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistCount = wishlistItems ? wishlistItems.length : 0;

  const { token, user, logout } = useAuthStore();

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Categories', to: '/category/all' },
    { label: 'About Us', to: '/about' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'My Profile', to: '/profile' },
  ];

  const MobileSidebar = () => (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/50 z-[100] md:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 w-[280px] h-full z-[101] shadow-2xl md:hidden flex flex-col bg-brand-beige"
          >
            {/* Sidebar Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="px-5 py-5 flex items-center justify-between border-b border-brand-gold/15 bg-brand-dark-blue"
            >
              <div className="flex items-center gap-3">
                <img src={image} alt="Houra Jewels" className="h-14 w-auto object-contain" />
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-base leading-none" style={{ color: '#C6A184' }}>HOURA JEWELS</span>
                  <span className="text-white text-[9px] tracking-widest mt-0.5">By S & M</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-white/60 hover:text-white bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>

            {/* Nav Links with stagger */}
            <nav className="flex flex-col p-4 gap-1 flex-grow overflow-y-auto">
              {navLinks.map(({ label, to }, i) => (
                <motion.div
                  key={to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
                >
                  <Link
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-brand-dark-blue font-semibold text-base py-3 px-4 rounded-xl hover:bg-brand-dark-blue hover:text-brand-gold transition-all"
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Login Button */}
            {!token && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.3 }}
                className="p-4 border-t border-brand-gold/15"
              >
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-brand-dark-blue text-brand-gold font-bold py-3.5 rounded-xl shadow-sm hover:bg-brand-dark-blue/90 transition-all"
                >
                  <LogIn className="w-4 h-4" /> Login to Account
                </Link>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );


  return (
    <>
      {/* Desktop Header is always full header */}
      <DesktopFullHeader cartCount={cartCount} wishlistCount={wishlistCount} token={token} user={user} handleLogout={handleLogout} />

      {/* Mobile Header is now global */}
      <div className="md:hidden">
        <MobileSidebar />
        <div className="h-[76px]" />
        <header className="fixed top-0 left-0 z-50 w-full bg-brand-dark-blue/95 backdrop-blur-md px-4 py-2 shadow-lg border-b border-white/5 h-[76px]">
          <div className="w-full h-full flex items-center justify-between relative">
            {/* Left: Menu & Logo */}
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors z-10">
                <Menu className="w-6 h-6 text-brand-gold" strokeWidth={1.5} />
              </button>

              <Link to="/" className="flex items-center gap-2.5 z-20">
                {/* Cropped Bird Icon (No Circle) */}
                <div className="w-10 h-10 overflow-hidden flex items-start justify-center shrink-0">
                  <img src={image} alt="Icon" className="w-[170%] max-w-none h-auto object-cover object-top -mt-2" />
                </div>
                {/* Text */}
                <div className="flex flex-col text-left mt-0.5">
                  <span className="font-serif font-bold text-[15px] sm:text-base leading-none tracking-[0.12em] text-brand-gold whitespace-nowrap">HOURA JEWELS</span>
                  <span className="text-white text-[8px] sm:text-[9px] tracking-[0.2em] mt-1 uppercase font-medium">By S & M</span>
                </div>
              </Link>
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-1 z-10">
              <button onClick={() => navigate('/category/all')} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <Search className="w-5 h-5 text-brand-gold" strokeWidth={1.5} />
              </button>
              <Link to="/profile" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <User className="w-5 h-5 text-brand-gold" strokeWidth={1.5} />
              </Link>
              <Link to="/cart" className="relative p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                <ShoppingCart className="w-5 h-5 text-brand-gold" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-brand-gold text-brand-dark-blue text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-brand-dark-blue">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
