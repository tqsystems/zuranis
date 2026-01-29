import type { NextAuthOptions } from "next-auth";
import { type DefaultSession } from "next-auth";
import GithubProvider from "next-auth/providers/github";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      login?: string;
      email?: string;
      name?: string;
      image?: string;
    };
  }

  interface User {
    id: string;
    login?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    login?: string;
    picture?: string;
  }
}

/**
 * NextAuth.js configuration for GitHub OAuth
 * 
 * This configuration includes:
 * - GitHub OAuth provider with appropriate scopes
 * - Custom sign-in page
 * - Session and JWT configuration
 * - Callback handlers for session and JWT
 * - Error handling
 */
export const authOptions: NextAuthOptions = {
  // Configure authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      
      // GitHub OAuth scopes
      // https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
      
      // Map GitHub profile to user object
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          login: profile.login,
        };
      },
    }),
  ],

  // Custom pages
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/",
  },

  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Callbacks for customizing behavior
  callbacks: {
    /**
     * Callback for sign-in authorization
     * Use this to control who can sign in
     */
    async signIn({ user, account, profile }) {
      try {
        // Add custom sign-in logic here
        // For example, check if user is allowed
        
        if (!user.email) {
          console.error("No email found for user", user);
          return false;
        }

        // You can add additional checks here
        // e.g., check if user exists in your database
        // e.g., check if email domain is allowed
        
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },

    /**
     * Callback for redirecting after authentication
     */
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      
      return baseUrl;
    },

    /**
     * JWT callback - called whenever a JWT is created or updated
     * Add custom claims to the JWT here
     */
    async jwt({ token, user, account, profile, trigger, session }) {
      try {
        // Initial sign in
        if (user) {
          token.id = user.id;
          token.login = (user as any).login;
          token.picture = user.image || undefined;
        }

        // Update token on session update
        if (trigger === "update" && session) {
          token = { ...token, ...session };
        }

        // Add GitHub access token to JWT (optional)
        if (account?.provider === "github" && account.access_token) {
          token.accessToken = account.access_token;
        }

        return token;
      } catch (error) {
        console.error("Error in jwt callback:", error);
        return token;
      }
    },

    /**
     * Session callback - called whenever a session is accessed
     * Add custom claims to the session here
     */
    async session({ session, token, user }) {
      try {
        // Add custom fields to session
        if (token && session.user) {
          session.user.id = token.id;
          session.user.login = token.login;
          session.user.image = token.picture;
          
          // Add access token to session (optional)
          if (token.accessToken) {
            (session as any).accessToken = token.accessToken;
          }
        }

        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session;
      }
    },
  },

  // Events for logging and analytics
  events: {
    async signIn({ user, account, profile }) {
      console.log(`User signed in: ${user.email}`);
      // Add custom event tracking here (e.g., analytics)
    },
    
    async signOut({ token, session }) {
      console.log(`User signed out: ${token?.email || session?.user?.email}`);
      // Add custom event tracking here
    },
    
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`);
      // Add custom logic for new users (e.g., send welcome email)
    },
  },

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",

  // Secret for encrypting tokens
  secret: process.env.NEXTAUTH_SECRET,
};
