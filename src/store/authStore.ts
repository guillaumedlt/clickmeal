import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  checkAdminStatus: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAdmin: false,
  loading: true,
  error: null,
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check admin status immediately after sign in
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      set({ 
        user: userCredential.user,
        isAdmin: userDoc.data()?.isAdmin || false,
        error: null 
      });
      
      return userCredential;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  signUp: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document with admin rights for specific email
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        isAdmin: email === 'delachetg@gmail.com',
        createdAt: serverTimestamp()
      });
      
      set({ 
        user: userCredential.user,
        isAdmin: email === 'delachetg@gmail.com',
        error: null
      });
      
      return userCredential;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, isAdmin: false, error: null });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  checkAdminStatus: async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        set({ isAdmin: false });
        return;
      }
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        set({ isAdmin: userDoc.data()?.isAdmin || false });
      } else {
        set({ isAdmin: false });
      }
    } catch (error: any) {
      console.error('Error checking admin status:', error);
      set({ isAdmin: false, error: error.message });
    }
  },
  clearError: () => set({ error: null })
}));

// Set up auth state listener
onAuthStateChanged(auth, async (user) => {
  useAuthStore.setState({ user, loading: false });
  if (user) {
    useAuthStore.getState().checkAdminStatus();
  }
});