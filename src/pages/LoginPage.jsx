import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ShieldCheck, Droplet, Feather } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/useAuthStore';
import logoImg from '../assets/image.png';
import brandLogo from '../assets/logo.png'; // Updated logo for mobile

export function LoginPage() {
  const navigate = useNavigate();
  const { login, googleLogin, loading, error } = useAuthStore();
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

  const handleGoogleSuccess = async (tokenResponse) => {
    setLocalError('');
    const res = await googleLogin(tokenResponse.access_token || tokenResponse.credential || tokenResponse.id_token);
    // Note: useGoogleLogin with flow: 'implicit' gives access_token. We can use googleAuth if it accepts id_token or access_token.
    // To get id_token, we should use standard credentialResponse from GoogleLogin, OR use implicit flow but backend needs userinfo endpoint.
    // Wait, the backend verifyIdToken expects an id_token!
    // So we should NOT use `useGoogleLogin` which only gives access_token unless we use flow: 'auth-code'.
    // Actually, `useGoogleLogin` with flow default gives an access token.
    // Let me revise this. I'll use `GoogleLogin` component if I want idToken easily, OR I can use `useGoogleLogin` and fetch user info on frontend and pass it, OR better yet, just use `googleAuth(tokenResponse.credential)` if I use the bare `GoogleLogin` component, OR I can just use `google-auth-library` verifyIdToken if I can get the id_token.
    // Let's use `useGoogleLogin` with `flow: 'implicit'` but wait! We can just fetch user info on the frontend and send it to our backend, or even better, if we need idToken, we can use `window.google.accounts.oauth2` or just use the `<GoogleLogin />` component. Since we have custom buttons, `useGoogleLogin` is required.
    // Wait! `useGoogleLogin` DOES NOT return an `id_token`. It only returns an `access_token`. The backend `verifyIdToken` requires an `id_token`.
    // Instead of `verifyIdToken` in backend, I can fetch `https://www.googleapis.com/oauth2/v3/userinfo` with the `access_token`!
    // That's much easier for custom buttons. Let's change backend to accept `accessToken` instead.
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLocalError('');
      // Send access_token to backend
      const res = await googleLogin(tokenResponse.access_token);
      if (res.success) navigate(res.role === 'admin' ? '/admin' : '/');
      else setLocalError(res.error);
    },
    onError: () => {
      setLocalError('Google Login Failed');
    },
  });

  const displayError = localError || error;

  return (
    <>
      {/* DESKTOP VIEW (Unchanged, hidden on mobile) */}
      <div className="hidden lg:flex min-h-screen font-sans">
        {/* Left Panel — Brand Visual */}
        <div className="w-1/2 bg-brand-dark-blue flex flex-col items-center justify-center relative overflow-hidden px-16">
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
              Premium Stainless Steel PVD Gold Plated Jewelry — Waterproof, Tarnish-Free, and made for Everyday Luxury.
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
        <div className="w-1/2 bg-brand-beige flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
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

              {/* OR Google */}
              <div className="flex items-center gap-3 w-full my-6">
                <div className="h-px bg-brand-dark-blue/10 flex-1"></div>
                <span className="text-brand-dark-blue/40 text-[10px] tracking-wider uppercase">OR</span>
                <div className="h-px bg-brand-dark-blue/10 flex-1"></div>
              </div>
              
              <button type="button" onClick={() => loginWithGoogle()} className="w-full bg-white border border-brand-dark-blue/10 text-brand-dark-blue font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 text-sm hover:bg-brand-dark-blue/5 transition-colors">
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
                Continue with Google
              </button>

            <p className="text-center text-sm text-brand-dark-blue/60 mt-8">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-brand-dark-blue hover:text-brand-gold transition-colors">
                Create Account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="lg:hidden min-h-screen bg-[#060B19] font-sans flex flex-col items-center justify-start px-6 py-10 overflow-y-auto">
        {/* Header / Logo */}
        <div className="flex flex-col items-center mt-4">
          <Link to="/">
            <img src={brandLogo} alt="Houra Jewels Logo" className="w-24 h-24 object-contain" />
          </Link>
          <span className="font-serif font-bold text-lg tracking-[0.15em] text-[#D4AF37] mt-2 text-center">
            HOURA JEWELS
          </span>
          <span className="text-[#D4AF37] text-[10px] font-bold tracking-widest uppercase mt-6">
            Welcome Back
          </span>
          <p className="text-white/70 text-xs text-center leading-relaxed max-w-[260px] mt-4">
            Premium Stainless Steel PVD Gold Plated Jewelry — Waterproof, Tarnish-Free, and made for Everyday Luxury.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-2 w-full max-w-xs mt-6 mb-6">
          <div className="h-px bg-[#D4AF37]/30 flex-1"></div>
          <div className="w-1.5 h-1.5 rotate-45 bg-[#D4AF37]"></div>
          <div className="h-px bg-[#D4AF37]/30 flex-1"></div>
        </div>

        {/* Sign In Heading */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-serif font-bold text-white mb-2">
            Sign <span className="text-[#D4AF37]">In</span>
          </h2>
          <div className="w-8 h-1 bg-[#D4AF37] mx-auto rounded-full mb-3"></div>
          <p className="text-white/50 text-xs">Enter your credentials to access your account.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div>
            <label className="text-xs font-medium text-white block mb-1.5 pl-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#D4AF37] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                name="email" type="email" value={form.email} onChange={handleChange} required
                placeholder="you@example.com"
                className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white block mb-1.5 pl-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#D4AF37] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                name="password" type={showPass ? 'text' : 'password'} value={form.password}
                onChange={handleChange} required
                placeholder="Your password"
                className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3.5 pl-11 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {displayError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 text-center">
              {displayError}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-[#e3c162] to-[#b38827] text-black font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-60 mt-4 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        {/* OR Google */}
        <div className="flex items-center gap-3 w-full max-w-sm my-6">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-white/40 text-[10px] tracking-wider uppercase">OR</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <button type="button" onClick={() => loginWithGoogle()} className="w-full max-w-sm bg-white text-black font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 text-sm hover:bg-gray-100 transition-colors">
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
          Continue with Google
        </button>

        <p className="text-center text-xs text-white/50 mt-8">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#D4AF37] hover:text-white transition-colors">
            Create Account
          </Link>
        </p>

        {/* Bottom Badges */}
        <div className="flex justify-between w-full max-w-sm mt-12 mb-4 px-2">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <span className="text-white text-[10px]">100% Tarnish Free</span>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <span className="text-white text-[10px]">Waterproof</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/30 flex items-center justify-center">
              <Feather className="w-5 h-5 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <span className="text-white text-[10px]">Hypoallergenic</span>
          </div>
        </div>
      </div>
    </>
  );
}
