import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, googleProvider, findUserByEmailInDB } from '../services/firebase';
import { signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This listener is the single source of truth for the user's auth state.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser && firebaseUser.email) {
          const appUser = await findUserByEmailInDB(firebaseUser.email);
          if (appUser) {
            setUser(appUser);
          } else {
            setError("Your account is not authorized to access this application.");
            setUser(null);
            await signOut(auth);
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        setError("An error occurred during authentication state check.");
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    });

    // Process the result of a redirect sign-in.
    // This will trigger the onAuthStateChanged listener above if successful.
    getRedirectResult(auth).catch((err) => {
      console.error("Error processing redirect result:", err);
      setError("An error occurred during sign-in. Please try again.");
      setIsInitializing(false); // Don't get stuck on loading screen
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // This navigates the user to the Google sign-in page.
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      setError("Failed to start sign in. Please try again.");
      console.error(err);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      setError("Failed to sign out.");
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isInitializing, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
