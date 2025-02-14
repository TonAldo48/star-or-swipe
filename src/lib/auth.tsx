'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import { 
  User, 
  GithubAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
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

  // Handle redirect result on mount and after redirects
  useEffect(() => {
    if (!auth) return;

    setLoading(true); // Set loading while checking redirect
    
    // Check for redirect result when the component mounts
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const credential = GithubAuthProvider.credentialFromResult(result);
          const token = credential?.accessToken;
          
          if (result.user && token) {
            console.log('Successfully signed in after redirect');
            setUser({
              ...result.user,
              githubAccessToken: token,
            });
          }
        }
      })
      .catch((error) => {
        const authError = error as AuthError;
        console.error('Error getting redirect result:', {
          code: authError.code,
          message: authError.message,
          email: authError.customData?.email,
        });
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
      if (firebaseUser) {
        // Get the most recent credential to ensure we have the token
        const currentProvider = firebaseUser.providerData[0];
        if (currentProvider?.providerId === 'github.com') {
          setUser({
            ...firebaseUser,
            // We'll get the token from the redirect result instead
            githubAccessToken: undefined,
          });
        } else {
          setUser(firebaseUser as AuthUser);
        }
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
        console.log('Using redirect sign-in for mobile device');
        // Clear any existing auth state before redirect
        await signOut(auth);
        // Use redirect method for mobile devices
        await signInWithRedirect(auth, provider);
        // The page will redirect to GitHub at this point
      } else {
        console.log('Using popup sign-in for desktop');
        // Use popup for desktop
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