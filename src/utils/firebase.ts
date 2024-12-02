import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const fetchUserCompany = async (userId: string) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();
  
  if (!userData?.companyId) {
    return null;
  }

  const companyDoc = await getDoc(doc(db, 'companies', userData.companyId));
  return companyDoc.exists() ? { id: companyDoc.id, ...companyDoc.data() } : null;
};

export const fetchOrderCompany = async (companyId: string) => {
  const companyDoc = await getDoc(doc(db, 'companies', companyId));
  return companyDoc.exists() ? companyDoc.data() : null;
};