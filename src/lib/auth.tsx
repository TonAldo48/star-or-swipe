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
    if (auth) {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          // Get the GitHub access token from the credential
          const credential = GithubAuthProvider.credentialFromResult(auth.currentUser);
          const token = credential?.accessToken;
          
          setUser({
            ...user,
            githubAccessToken: token,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  const signInWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider();
      // Only request public access and starring ability
      provider.addScope('public_repo');
      
      if (auth) {
        const result = await signInWithPopup(auth, provider);
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        
        if (result.user && token) {
          setUser({
            ...result.user,
            githubAccessToken: token,
          });
        }
      }
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
    }
  };

  const signOutUser = async () => {
    try {
      if (auth) {
        await signOut(auth);
        setUser(null);
      }
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