import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import logoImg from '../assets/image.png';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    const res = await login(form.email, form.password);
    if (res.success) navigate(res.role === 'admin' ? '/admin' : '/');
    else setLocalError(res.error);
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex font-sans">

      {/* Left Panel — Brand Visual */}
      <div className="hidden lg:flex w-1/2 bg-brand-dark-blue flex-col items-center justify-center relative overflow-hidden px-16">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border border-brand-gold/10"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full border border-brand-gold/10"></div>
        <div className="absolute top-1/3 right-8 w-40 h-40 rounded-full bg-brand-gold/5"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 text-center"
        >
          <Link to="/">
            <img src={logoImg} alt="Houra Jewels" className="h-28 w-auto object-contain mx-auto mb-10 drop-shadow-xl" />
          </Link>

          <h1 className="text-4xl font-serif font-bold text-white mb-4 leading-tight">
            Welcome to<br />
            <span style={{ color: '#C6A184' }}>Houra Jewels</span>
          </h1>
          <div className="w-16 h-1" style={{ background: '#C6A184', borderRadius: 99, margin: '0 auto 20px' }}></div>
          <p className="text-white/60 text-base leading-relaxed max-w-xs mx-auto">
            Premium 18K PVD Gold Plated Jewelry — Waterproof, Tarnish-Free, and made for Everyday Luxury.
          </p>

          {/* Trust badges */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            {['100% Tarnish Free', 'Waterproof', 'Hypoallergenic'].map((tag, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center">
                  <svg className="w-5 h-5" style={{ color: '#C6A184' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/50 text-xs text-center">{tag}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 bg-brand-beige flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <Link to="/">
              <img src={logoImg} alt="Houra Jewels" className="h-20 object-contain mb-3" />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h4 className="text-brand-gold font-bold tracking-widest uppercase text-xs mb-2">Welcome Back</h4>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark-blue mb-2">Sign In</h2>
            <div className="w-14 h-1 bg-brand-gold rounded-full"></div>
            <p className="text-brand-dark-blue/60 text-sm mt-4">Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-brand-dark-blue block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-dark-blue/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  name="email" type="email" value={form.email} onChange={handleChange} required
                  placeholder="you@example.com"
                  className="w-full bg-white border border-brand-gold/20 rounded-xl px-4 py-3.5 pl-11 text-sm text-brand-dark-blue placeholder:text-brand-dark-blue/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 transition-shadow"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-brand-dark-blue block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-dark-blue/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  name="password" type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} required
                  placeholder="Your password"
                  className="w-full bg-white border border-brand-gold/20 rounded-xl px-4 py-3.5 pl-11 pr-12 text-sm text-brand-dark-blue placeholder:text-brand-dark-blue/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 transition-shadow"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark-blue/40 hover:text-brand-dark-blue transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {displayError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 text-center">
                {displayError}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full bg-brand-dark-blue text-brand-gold font-bold py-4 rounded-xl text-sm hover:bg-brand-dark-blue/90 transition-all disabled:opacity-60 mt-2 shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-brand-dark-blue/60 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-brand-dark-blue hover:text-brand-gold transition-colors">
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
