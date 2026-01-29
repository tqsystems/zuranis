/**
 * Client-side authentication utilities
 * 
 * These utilities are for use in Client Components.
 * For Server Components, use the functions from @/lib/auth
 */

import { signIn, signOut } from "next-auth/react";

/**
 * Sign in with GitHub
 * @param callbackUrl - URL to redirect to after sign in
 */
export async function signInWithGitHub(callbackUrl?: string) {
  try {
    await signIn("github", { 
      callbackUrl: callbackUrl || "/",
      redirect: true,
    });
  } catch (error) {
    console.error("Error signing in with GitHub:", error);
    throw error;
  }
}

/**
 * Sign out the current user
 * @param callbackUrl - URL to redirect to after sign out
 */
export async function signOutUser(callbackUrl?: string) {
  try {
    await signOut({ 
      callbackUrl: callbackUrl || "/",
      redirect: true,
    });
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

/**
 * Get the initials from a name
 * @param name - Full name
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
export function getInitials(name?: string | null): string {
  if (!name) return "?";
  
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get the display name for a user
 * Falls back to email or "User" if name is not available
 */
export function getDisplayName(user?: {
  name?: string | null;
  email?: string | null;
  login?: string | null;
}): string {
  if (user?.name) return user.name;
  if (user?.login) return user.login;
  if (user?.email) return user.email.split("@")[0];
  return "User";
}

/**
 * Format the sign-in URL with a callback
 * @param callbackUrl - URL to redirect to after sign in
 */
export function getSignInUrl(callbackUrl?: string): string {
  const url = "/auth/signin";
  if (callbackUrl) {
    return `${url}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }
  return url;
}

/**
 * Check if an email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Mask an email address for privacy
 * @example "john.doe@example.com" -> "j***e@example.com"
 */
export function maskEmail(email: string): string {
  if (!email) return "";
  
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}
