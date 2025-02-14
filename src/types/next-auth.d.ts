import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string
    firebaseUid?: string
    user?: {
      id: string
      githubAccessToken?: string
    } & DefaultSession["user"]
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
      name: string | null
      email: string | null
    }
  }
}

// GitHub OAuth profile type
declare module "next-auth/providers/github" {
  interface GitHubProfile {
    login: string
    id: number
    node_id: string
    avatar_url: string
    html_url: string
    name: string | null
    email: string | null
  }
} 