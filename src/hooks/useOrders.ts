import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { Order } from '../types';

interface UseOrdersProps {
  userId?: string;
  isAdmin?: boolean;
}

export const useOrders = ({ userId, isAdmin }: UseOrdersProps = {}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin && !userId) {
      setLoading(false);
      return;
    }

    // For admin, fetch all orders. For users, fetch only their orders
    const ordersQuery = isAdmin
      ? query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      : query(
          collection(db, 'orders'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );

    const unsubscribe = onSnapshot(
      ordersQuery,
      {
        next: async (snapshot) => {
          try {
            const ordersData = await Promise.all(
              snapshot.docs.map(async (doc) => {
                const data = doc.data();
                
                // Fetch company data
                let companyData = null;
                if (data.companyId) {
                  try {
                    const companyDoc = await getDoc(doc(db, 'companies', data.companyId));
                    if (companyDoc.exists()) {
                      companyData = {
                        id: companyDoc.id,
                        ...companyDoc.data()
                      };
                    }
                  } catch (error) {
                    console.error('Error fetching company:', error);
                  }
                }

                // Fetch user data
                let userData = null;
                if (data.userId) {
                  try {
                    const userDoc = await getDoc(doc(db, 'users', data.userId));
                    if (userDoc.exists()) {
                      userData = {
                        id: userDoc.id,
                        email: userDoc.data().email,
                        companyId: userDoc.data().companyId
                      };
                    }
                  } catch (error) {
                    console.error('Error fetching user:', error);
                  }
                }

                return {
                  id: doc.id,
                  ...data,
                  company: companyData,
                  user: userData,
                  createdAt: data.createdAt?.toDate() || new Date(),
                  deliveryDate: data.deliveryDate?.toDate() || new Date()
                } as Order;
              })
            );

            setOrders(ordersData);
            setError(null);
          } catch (error: any) {
            console.error('Error processing orders:', error);
            setError(error.message);
            toast.error('Erreur lors du chargement des commandes');
          } finally {
            setLoading(false);
          }
        },
        error: (error) => {
          console.error('Orders subscription error:', error);
          setError(error.message);
          setLoading(false);
          toast.error('Erreur lors du chargement des commandes');
        }
      }
    );

    return () => unsubscribe();
  }, [userId, isAdmin]);

  return { orders, loading, error };
};