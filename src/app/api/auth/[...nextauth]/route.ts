import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { signInWithCredential, GithubAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      authorization: {
        params: {
          // Only request access to public repositories and user info
          scope: 'read:user user:email public_repo',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      console.log('JWT Callback - Token before:', token);
      console.log('JWT Callback - Account:', account);
      console.log('JWT Callback - User:', user);

      if (account && account.access_token) {
        // Initial sign in
        token.accessToken = account.access_token;
        token.profile = profile;
        
        try {
          const credential = GithubAuthProvider.credential(account.access_token);
          const firebaseResult = await signInWithCredential(auth!, credential);
          token.firebaseUid = firebaseResult.user.uid;
        } catch (error) {
          console.error('Error signing in with Firebase:', error);
        }
      }

      console.log('JWT Callback - Token after:', token);
      return token;
    },
    async session({ session, token, user }) {
      console.log('Session Callback - Input:', { session, token, user });

      // Make sure to copy the access token to the session
      if (token) {
        session.accessToken = token.accessToken;
        session.firebaseUid = token.firebaseUid;
        
        // Ensure user profile data is included
        if (token.profile) {
          session.user = {
            ...session.user,
            ...token.profile,
          };
        }
      }

      console.log('Session Callback - Output:', session);
      return session;
    },
  },
  events: {
    async signIn(message) {
      console.log('SignIn event:', message);
    },
    async session(message) {
      console.log('Session event:', message);
    },
  },
  debug: true, // Enable debug messages in development
});

export { handler as GET, handler as POST }; 