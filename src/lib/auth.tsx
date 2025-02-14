'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import { 
  User, 
  GithubAuthProvider, 
  signInWithPopup,
  signOut,
  AuthError
} from 'firebase/auth';

interface AuthUser extends User {
  githubAccessToken?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGithub: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGithub: async () => {},
  signOutUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
      if (firebaseUser) {
        setUser(firebaseUser as AuthUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGithub = async () => {
    try {
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }

      const provider = new GithubAuthProvider();
      provider.addScope('public_repo');

      console.log('Using popup sign-in');
      const result = await signInWithPopup(auth, provider);
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (result.user && token) {
        console.log('Successfully signed in with popup');
        setUser({
          ...result.user,
          githubAccessToken: token,
        });
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error('Error signing in with GitHub:', {
        code: authError.code,
        message: authError.message,
        email: authError.customData?.email,
      });
      
      // Log specific Firebase Auth errors
      if (authError.code === 'auth/popup-blocked') {
        console.error('Popup was blocked by the browser');
      } else if (authError.code === 'auth/popup-closed-by-user') {
        console.error('Popup was closed by the user');
      } else if (authError.code === 'auth/unauthorized-domain') {
        console.error('Domain not authorized for Firebase Auth');
      } else if (authError.code === 'auth/operation-not-allowed') {
        console.error('GitHub authentication not enabled in Firebase');
      }
      
      throw error; // Re-throw to handle in UI if needed
    }
  };

  const signOutUser = async () => {
    try {
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }

      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGithub, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 