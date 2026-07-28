import { create } from 'zustand';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export const useStoreData = create((set) => ({
  products: [],
  categories: [],
  offers: [],
  loading: true,
  fetchData: async () => {
    try {
      set({ loading: true });
      const [prodRes, catRes, offerRes] = await Promise.all([
        fetch(`${BACKEND_URL}/general/products`),
        fetch(`${BACKEND_URL}/general/categories`),
        fetch(`${BACKEND_URL}/general/offers`)
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      const offerData = await offerRes.json();
      
      set({ 
        products: prodData.products || [], 
        categories: catData.categories || [],
        offers: offerData.offers || [],
        loading: false 
      });
    } catch (err) {
      console.error("Failed to fetch store data:", err);
      set({ loading: false });
    }
  }
}));
