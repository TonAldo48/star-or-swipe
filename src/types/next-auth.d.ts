import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    firebaseUid?: string
    user?: {
      name?: string | null
      email?: string | null
      image?: string | null
      login?: string
      id?: number
      node_id?: string
      avatar_url?: string
      html_url?: string
    }
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