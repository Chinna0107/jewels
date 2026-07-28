import { create } from 'zustand';
import api from '../utils/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  addresses: [],
  orders: [],
  loading: false,
  error: null,

  signup: async (name, email, phone, password) => {
    set({ loading: true, error: null });
    try {
      await api.post('/auth/signup', { name, email, phone, password });
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Signup failed';
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  verifyOtp: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('token', data.token);
      set({ token: data.token, user: data.user, loading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'OTP verification failed';
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ token: data.token, user: data.user, loading: false });
      return { success: true, role: data.user.role };
    } catch (err) {
      const error = err.response?.data?.error || 'Login failed';
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  googleLogin: async (idToken) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/google', { idToken });
      localStorage.setItem('token', data.token);
      set({ token: data.token, user: data.user, loading: false });
      return { success: true, role: data.user.role };
    } catch (err) {
      const error = err.response?.data?.error || 'Google Login failed';
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  fetchProfile: async () => {
    if (!get().token) return;
    set({ loading: true });
    try {
      const { data } = await api.get('/auth/profile');
      set({ user: data.user, addresses: data.addresses, orders: data.orders, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updateProfile: async (name, phone) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put('/auth/profile', { name, phone });
      set({ user: data.user, loading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Update failed';
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  addAddress: async (addressData) => {
    try {
      const { data } = await api.post('/auth/address', addressData);
      set((state) => ({ addresses: [...state.addresses, data.address] }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to add address' };
    }
  },

  deleteAddress: async (id) => {
    try {
      await api.delete(`/auth/address/${id}`);
      set((state) => ({ addresses: state.addresses.filter((a) => a.id !== id) }));
    } catch {}
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, addresses: [], orders: [] });
  },

  isLoggedIn: () => !!get().token,
}));
