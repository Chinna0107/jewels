import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useToastStore } from './useToastStore';

function validateCouponAgainstCart(coupon, items) {
  if (!coupon) return null;
  const cartQty = items.reduce((s, i) => s + i.qty, 0);
  const cartValue = items.reduce((s, i) => s + ((i.variant?.price || i.product?.price || 0) * i.qty), 0);
  if (coupon.min_type === 'qty' && cartQty < (coupon.min_qty || 0)) {
    useToastStore.getState().showToast(`Coupon removed: need at least ${coupon.min_qty} item(s)`, 'error');
    return null;
  }
  if (coupon.min_type !== 'qty' && cartValue < (coupon.min_order_value || 0)) {
    useToastStore.getState().showToast(`Coupon removed: minimum order \u20b9${coupon.min_order_value} required`, 'error');
    return null;
  }
  return coupon;
}
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      deliveryCharge: 0,
      appliedCoupon: null,
      
      addToCart: (product, variant, qty = 1, color) => {
        const stock = variant?.stock !== undefined ? Number(variant.stock) : Number(product?.stock || 0);
        if (stock <= 0) {
          useToastStore.getState().showToast('This item is out of stock', 'error');
          return;
        }
        const variantWithColor = { ...variant, color: color || variant?.color || '' };
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.product.id === product.id && i.variant?.size === variantWithColor?.size && i.variant?.color === variantWithColor?.color
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            const newQty = newItems[existingItemIndex].qty + qty;
            if (newQty > stock) {
              useToastStore.getState().showToast(`Only ${stock} in stock`, 'error');
              newItems[existingItemIndex].qty = stock;
            } else {
              newItems[existingItemIndex].qty = newQty;
            }
            return { items: newItems };
          }

          return { items: [...state.items, { product, variant: variantWithColor, qty: Math.min(qty, stock) }] };
        });
        useToastStore.getState().showToast(`Added ${product.name} to cart!`);
      },
      
      removeFromCart: (productId, variant) => set((state) => {
        const newItems = state.items.filter(item => !(item.product.id === productId && item.variant?.size === variant?.size && item.variant?.color === variant?.color));
        return { items: newItems, appliedCoupon: validateCouponAgainstCart(state.appliedCoupon, newItems) };
      }),
      
      updateQuantity: (productId, variant, qty) => set((state) => {
        const stock = variant?.stock !== undefined ? Number(variant.stock) : 0;
        const cappedQty = stock > 0 ? Math.min(qty, stock) : qty;
        let newItems;
        if (cappedQty <= 0) {
          newItems = state.items.filter(item => !(item.product.id === productId && item.variant?.size === variant?.size && item.variant?.color === variant?.color));
        } else {
          newItems = state.items.map(item =>
            (item.product.id === productId && item.variant?.size === variant?.size && item.variant?.color === variant?.color) ? { ...item, qty: cappedQty } : item
          );
        }
        return { items: newItems, appliedCoupon: validateCouponAgainstCart(state.appliedCoupon, newItems) };
      }),

      clearCart: () => set({ items: [], appliedCoupon: null }),

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      removeCoupon: () => set({ appliedCoupon: null }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const price = item.variant?.price || item.product.price || 0;
          return sum + (price * item.qty);
        }, 0);
      },

      getTotalSavings: () => {
        return get().items.reduce((sum, item) => {
          const originalPrice = item.variant?.originalPrice || item.product.originalPrice;
          const currentPrice = item.variant?.price || item.product.price;
          if (originalPrice && originalPrice > currentPrice) {
            return sum + ((originalPrice - currentPrice) * item.qty);
          }
          return sum;
        }, 0);
      },

      getDiscount: () => {
        const subtotal = get().getSubtotal();
        const coupon = get().appliedCoupon;
        if (!coupon) return 0;
        
        let discount = 0;
        const discountValue = Number(coupon.discount_value) || 0;
        if (coupon.discount_type === 'percentage') {
          discount = subtotal * (discountValue / 100);
        } else {
          discount = discountValue; // flat amount
        }
        return discount > subtotal ? subtotal : discount;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        return subtotal > 0 ? (subtotal - discount) + get().deliveryCharge : 0;
      }
    }),
    {
      name: 'pooja-cart-storage',
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        deliveryCharge: 0
      })
    }
  )
);
