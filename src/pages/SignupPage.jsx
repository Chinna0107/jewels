import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import logoImg from '../assets/image.png';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, verifyOtp, loading, error } = useAuthStore();

  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState('');
  const otpRefs = useRef([]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLocalError('');
    const res = await signup(form.name, form.email, form.phone, form.password);
    if (res.success) setStep('otp');
    else setLocalError(res.error);
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLocalError('');
    const code = otp.join('');
    if (code.length < 6) return setLocalError('Enter all 6 digits');
    const res = await verifyOtp(form.email, code);
    if (res.success) navigate('/');
    else setLocalError(res.error);
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex font-sans">

      {/* Left Panel — Brand Visual */}
      <div className="hidden lg:flex w-1/2 bg-brand-dark-blue flex-col items-center justify-center relative overflow-hidden px-16">
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
            Join the<br />
            <span style={{ color: '#C6A184' }}>Houra Jewels</span><br />
            <span className="text-white">Family</span>
          </h1>
          <div className="w-16 h-1 mx-auto mb-5 rounded-full" style={{ background: '#C6A184' }}></div>
          <p className="text-white/60 text-base leading-relaxed max-w-xs mx-auto">
            Create your account and get exclusive access to our premium 18K gold plated collections.
          </p>

          <div className="mt-12 space-y-4">
            {[
              { icon: '✨', text: 'Exclusive member-only offers' },
              { icon: '📦', text: 'Easy order tracking & returns' },
              { icon: '💛', text: 'Personalized jewelry picks' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-left">
                <div className="w-9 h-9 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0 text-base">{item.icon}</div>
                <span className="text-white/60 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel — Signup Form */}
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

          {step === 'form' ? (
            <>
              <div className="mb-8">
                <h4 className="text-brand-gold font-bold tracking-widest uppercase text-xs mb-2">Get Started</h4>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark-blue mb-2">Create Account</h2>
                <div className="w-14 h-1 bg-brand-gold rounded-full"></div>
                <p className="text-brand-dark-blue/60 text-sm mt-4">Fill in your details to create your Houra Jewels account.</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-sm font-semibold text-brand-dark-blue block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-brand-dark-blue/40 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      name="name" value={form.name} onChange={handleChange} required
                      placeholder="Your full name"
                      className="w-full bg-white border border-brand-gold/20 rounded-xl px-4 py-3.5 pl-11 text-sm text-brand-dark-blue placeholder:text-brand-dark-blue/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 transition-shadow"
                    />
                  </div>
                </div>

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

                {/* Phone */}
                <div>
                  <label className="text-sm font-semibold text-brand-dark-blue block mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-brand-dark-blue/40 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      name="phone" value={form.phone} onChange={handleChange} required
                      placeholder="+91 98765 43210"
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
                      onChange={handleChange} required minLength={6}
                      placeholder="Min 6 characters"
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
                  {loading ? 'Sending OTP...' : 'Send OTP & Continue →'}
                </motion.button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h4 className="text-brand-gold font-bold tracking-widest uppercase text-xs mb-2">Almost there!</h4>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark-blue mb-2">Verify Email</h2>
                <div className="w-14 h-1 bg-brand-gold rounded-full"></div>
                <p className="text-brand-dark-blue/60 text-sm mt-4">
                  We sent a 6-digit OTP to <strong className="text-brand-dark-blue">{form.email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-center gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      className="w-12 h-14 text-center text-xl font-bold bg-white border-2 border-brand-gold/20 rounded-xl text-brand-dark-blue focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  ))}
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
                  className="w-full bg-brand-dark-blue text-brand-gold font-bold py-4 rounded-xl text-sm hover:bg-brand-dark-blue/90 transition-all disabled:opacity-60 shadow-lg"
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account →'}
                </motion.button>

                <button type="button" onClick={() => setStep('form')}
                  className="w-full text-sm text-brand-dark-blue/50 hover:text-brand-dark-blue transition-colors">
                  ← Change details
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-brand-dark-blue/60 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-dark-blue hover:text-brand-gold transition-colors">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
