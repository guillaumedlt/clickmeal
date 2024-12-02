import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

export const useCompany = () => {
  const { user } = useAuthStore();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        if (!userData?.companyId) {
          setLoading(false);
          return;
        }

        const companyDoc = await getDoc(doc(db, 'companies', userData.companyId));
        if (companyDoc.exists()) {
          setCompany({ id: companyDoc.id, ...companyDoc.data() });
          setError(null);
        }
      } catch (error: any) {
        console.error('Error fetching company:', error);
        setError(error.message);
        toast.error('Erreur lors du chargement des informations de l\'entreprise');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [user]);

  return { company, loading, error };
};