import { create } from 'zustand';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { toast } from 'react-hot-toast';

interface OrderStore {
  orders: Order[];
  loading: boolean;
  error: string | null;
  filter: 'all' | 'pending' | 'confirmed' | 'delivered';
  setOrders: (orders: Order[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: 'all' | 'pending' | 'confirmed' | 'delivered') => void;
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => Promise<void>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  loading: true,
  error: null,
  filter: 'all',
  
  setOrders: (orders) => set({ orders }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilter: (filter) => set({ filter }),

  updateOrderStatus: async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });
      
      // Update local state
      set(state => ({
        orders: state.orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      }));
      
      toast.success('Statut de la commande mis à jour');
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
      throw error;
    }
  }
}));