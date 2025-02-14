import type { NextAuth } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      accessToken: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    firebaseUid?: string
    profile?: {
      login: string
      id: number
      node_id: string
      avatar_url: string
      html_url: string
      name: string
      email: string
    }
  }
} 