import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "./auth-options";
import type { Session } from "next-auth";

/**
 * Get the current session on the server side
 * @returns Session object or null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Get the current authenticated user
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const session = await getSession();
    return session?.user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Get the current user's ID
 * @returns User ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    return user?.id || null;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}

/**
 * Get the current user's GitHub username
 * @returns GitHub username or null if not authenticated
 */
export async function getCurrentUserLogin(): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    return user?.login || null;
  } catch (error) {
    console.error("Error getting current user login:", error);
    return null;
  }
}

/**
 * Check if the user is authenticated
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession();
    return !!session?.user;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
}

/**
 * Require authentication and return the user
 * Redirects to sign-in page if not authenticated
 * @param callbackUrl - URL to redirect to after sign-in
 * @returns User object (guaranteed to exist)
 */
export async function requireAuth(callbackUrl?: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    const redirectUrl = callbackUrl 
      ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/auth/signin";
    redirect(redirectUrl);
  }
  
  return user;
}

/**
 * Require authentication and return the session
 * Redirects to sign-in page if not authenticated
 * @param callbackUrl - URL to redirect to after sign-in
 * @returns Session object (guaranteed to exist)
 */
export async function requireSession(callbackUrl?: string): Promise<Session> {
  const session = await getSession();
  
  if (!session) {
    const redirectUrl = callbackUrl 
      ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/auth/signin";
    redirect(redirectUrl);
  }
  
  return session;
}

/**
 * Check if user is authenticated and has required email
 * @param requiredEmail - Email to check against
 * @returns true if user has the required email
 */
export async function hasEmail(requiredEmail: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user?.email === requiredEmail;
  } catch (error) {
    console.error("Error checking user email:", error);
    return false;
  }
}

/**
 * Check if user is authenticated and has email in allowed list
 * @param allowedEmails - Array of allowed emails
 * @returns true if user's email is in the allowed list
 */
export async function hasEmailInList(allowedEmails: string[]): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return allowedEmails.includes(user?.email || "");
  } catch (error) {
    console.error("Error checking user email in list:", error);
    return false;
  }
}

/**
 * Check if user is authenticated and email domain matches
 * @param domain - Domain to check (e.g., "example.com")
 * @returns true if user's email domain matches
 */
export async function hasEmailDomain(domain: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user?.email) return false;
    
    const userDomain = user.email.split("@")[1];
    return userDomain === domain;
  } catch (error) {
    console.error("Error checking user email domain:", error);
    return false;
  }
}

/**
 * Get access token from session (if available)
 * @returns Access token or null
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await getSession();
    return (session as any)?.accessToken || null;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
}
