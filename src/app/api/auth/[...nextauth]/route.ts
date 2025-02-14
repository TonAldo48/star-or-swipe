import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { signInWithCredential, GithubAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { GitHubProfile } from "next-auth/providers/github";

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
    async jwt({ token, account, profile }) {
      if (account && account.access_token) {
        token.accessToken = account.access_token;
        
        // Cast profile to GitHubProfile type
        const githubProfile = profile as GitHubProfile;
        if (githubProfile) {
          token.profile = {
            login: githubProfile.login,
            id: githubProfile.id,
            node_id: githubProfile.node_id,
            avatar_url: githubProfile.avatar_url,
            html_url: githubProfile.html_url,
            name: githubProfile.name,
            email: githubProfile.email,
          };
        }
        
        try {
          const credential = GithubAuthProvider.credential(account.access_token);
          const firebaseResult = await signInWithCredential(auth!, credential);
          token.firebaseUid = firebaseResult.user.uid;
        } catch (error) {
          console.error('Error signing in with Firebase:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.firebaseUid = token.firebaseUid;
        
        if (token.profile) {
          session.user = {
            ...session.user,
            id: token.profile.id.toString(),
            githubAccessToken: token.accessToken,
          };
        }
      }
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