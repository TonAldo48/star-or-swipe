'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import { User, GithubAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

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

    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // We'll get the token from the sign-in process instead
        setUser({
          ...firebaseUser,
          githubAccessToken: undefined, // Will be set during sign in
        });
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
      // Only request public access and starring ability
      provider.addScope('public_repo');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (result.user && token) {
        setUser({
          ...result.user,
          githubAccessToken: token,
        });
      }
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
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