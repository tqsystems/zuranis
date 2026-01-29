import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

/**
 * NextAuth.js Route Handler
 * 
 * This handles all NextAuth.js authentication routes:
 * - GET  /api/auth/signin
 * - POST /api/auth/signin/:provider
 * - GET  /api/auth/callback/:provider
 * - GET  /api/auth/signout
 * - POST /api/auth/signout
 * - GET  /api/auth/session
 * - GET  /api/auth/csrf
 * - GET  /api/auth/providers
 * 
 * The configuration is imported from @/lib/auth-options
 * to keep the route handler clean and allow reuse of the config.
 */

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
