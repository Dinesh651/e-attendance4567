import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  Auth
} from 'firebase/auth';

// --- Firebase Configuration ---
// This configuration is moved here from public/firebaseConfig.js to prevent race conditions.
const firebaseConfig = {
  apiKey: "AIzaSyAorD9R4FiSq6M1MeJwFukkO3Leu7q6F7o",
  authDomain: "cozey-8ad64.firebaseapp.com",
  databaseURL: "https://cozey-8ad64.firebaseio.com",
  projectId: "cozey-8ad64",
  storageBucket: "cozey-8ad64.appspot.com",
  messagingSenderId: "841803166613",
  appId: "1:841803166613:web:154d11830d7ef9144f3c9c",
  measurementId: "G-94BYMYTS85"
};
// --- End of Configuration ---

let app: FirebaseApp;
let authInstance: Auth;

const initializeFirebase = () => {
    // Only initialize if it hasn't been done yet.
    if (!app) {
        app = initializeApp(firebaseConfig);
        authInstance = getAuth(app);
    }
};

// This function will be the single point of access for the auth instance.
export const getFirebaseAuth = (): Auth => {
    if (!authInstance) {
        initializeFirebase();
    }
    return authInstance;
};

// Export other Firebase services and utilities as before
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, signOut, onAuthStateChanged };