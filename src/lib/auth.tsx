'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import { 
  User, 
  GithubAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut 
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

// Helper to detect mobile devices
function isMobileDevice() {
  return (
    typeof window !== 'undefined' && 
    (navigator.userAgent.match(/Android/i) ||
     navigator.userAgent.match(/webOS/i) ||
     navigator.userAgent.match(/iPhone/i) ||
     navigator.userAgent.match(/iPad/i) ||
     navigator.userAgent.match(/iPod/i) ||
     navigator.userAgent.match(/BlackBerry/i) ||
     navigator.userAgent.match(/Windows Phone/i))
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;

    // Check for redirect result when the component mounts
    getRedirectResult(auth).then((result) => {
      if (result) {
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        
        if (result.user && token) {
          setUser({
            ...result.user,
            githubAccessToken: token,
          });
        }
      }
    }).catch((error) => {
      console.error('Error getting redirect result:', error);
    });

    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(prev => ({
          ...firebaseUser,
          githubAccessToken: prev?.githubAccessToken, // Preserve the token if it exists
        }));
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

      if (isMobileDevice()) {
        // Use redirect method for mobile devices
        await signInWithRedirect(auth, provider);
      } else {
        // Use popup for desktop
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
    } catch (error: any) {
      console.error('Error signing in with GitHub:', {
        code: error.code,
        message: error.message,
        email: error.email,
        credential: error.credential,
      });
      
      // Log specific Firebase Auth errors
      if (error.code === 'auth/popup-blocked') {
        console.error('Popup was blocked by the browser');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.error('Popup was closed by the user');
      } else if (error.code === 'auth/unauthorized-domain') {
        console.error('Domain not authorized for Firebase Auth');
      } else if (error.code === 'auth/operation-not-allowed') {
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