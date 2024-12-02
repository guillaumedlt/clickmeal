import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { PromoCode } from '../types';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isFormula?: boolean;
  formulaDetails?: {
    starterId: string;
    mainId: string;
    dessertId: string;
  };
}

interface CartStore {
  items: CartItem[];
  deliveryDate: Date | null;
  promoCode: PromoCode | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setDeliveryDate: (date: Date) => void;
  applyPromoCode: (code: PromoCode) => void;
  removePromoCode: () => void;
  clearCart: () => void;
  subtotal: () => number;
  discount: () => number;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryDate: null,
      promoCode: null,
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => {
            if (item.isFormula) {
              return i.id === item.id && 
                i.formulaDetails?.starterId === item.formulaDetails?.starterId &&
                i.formulaDetails?.mainId === item.formulaDetails?.mainId &&
                i.formulaDetails?.dessertId === item.formulaDetails?.dessertId;
            }
            return i.id === item.id;
          });

          if (existingItem) {
            return {
              ...state,
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { 
            ...state,
            items: [...state.items, { ...item, quantity: 1 }] 
          };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          ...state,
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          ...state,
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
      setDeliveryDate: (date) => {
        set((state) => ({ ...state, deliveryDate: date }));
      },
      applyPromoCode: (code) => {
        const subtotal = get().subtotal();
        if (code.minOrderValue && subtotal < code.minOrderValue) {
          toast.error(`Montant minimum requis: ${code.minOrderValue}€`);
          return;
        }
        set((state) => ({ ...state, promoCode: code }));
        toast.success('Code promo appliqué !');
      },
      removePromoCode: () => {
        set((state) => ({ ...state, promoCode: null }));
      },
      clearCart: () => {
        set({ items: [], deliveryDate: null, promoCode: null });
      },
      subtotal: () => {
        const items = get().items;
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      discount: () => {
        const promoCode = get().promoCode;
        const subtotal = get().subtotal();
        
        if (!promoCode) return 0;
        
        if (promoCode.discountType === 'percentage') {
          return (subtotal * promoCode.discountValue) / 100;
        } else {
          return promoCode.discountValue;
        }
      },
      total: () => {
        return get().subtotal() - get().discount();
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        deliveryDate: state.deliveryDate ? state.deliveryDate.toISOString() : null,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.deliveryDate) {
          state.deliveryDate = new Date(state.deliveryDate);
        }
      },
    }
  )
);