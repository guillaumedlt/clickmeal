import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC6ujzr9aKf7dP_k43KyYInuHYveRsag20",
  authDomain: "clickmeal-eec36.firebaseapp.com",
  projectId: "clickmeal-eec36",
  storageBucket: "clickmeal-eec36.firebasestorage.app",
  messagingSenderId: "323211734703",
  appId: "1:323211734703:web:19adbe81e94d7e35d6ee5a",
  measurementId: "G-7J0QWHHKF1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with better offline persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize other services
const auth = getAuth(app);
const storage = getStorage(app);

// Export initialized services
export { db, auth, storage };