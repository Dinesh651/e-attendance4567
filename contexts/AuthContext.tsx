import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirebaseAuth, googleProvider, signInWithPopup, signOut } from '../services/firebase';
import { api } from '../services/mockApi';
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
    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser && firebaseUser.email) {
              const appUser = await api.findUserByEmail(firebaseUser.email);
              if (appUser) {
                  setUser(appUser);
              } else {
                  setUser(null);
                  setError("Your account is not authorized to access this application.");
                  await signOut(auth);
              }
          } else {
            setUser(null);
          }
        } catch (e) {
          setError("An error occurred during authentication.");
          setUser(null);
        } finally {
          setIsInitializing(false);
        }
      });

      return () => unsubscribe();
    } catch (e: any) {
        setError(e.message);
        setIsInitializing(false);
    }
  }, []);

  const login = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();
      await signInWithPopup(auth, googleProvider);
      // The onAuthStateChanged listener will handle setting the user
    } catch (e: any) {
        console.error(e);
        if (e.code === 'auth/popup-closed-by-user') {
            setError('Sign-in process was cancelled.');
        } else {
            setError('Failed to sign in with Google. Please try again.');
        }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      setUser(null);
    } catch (e) {
      setError('Failed to sign out.');
    } finally {
      setIsLoading(false);
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
