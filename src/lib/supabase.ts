import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get Supabase client for client-side usage
 * Uses lazy initialization to avoid build-time errors
 * Singleton pattern ensures only one client instance
 * 
 * @returns Supabase client instance
 * @throws Error if environment variables are not set
 */
export function getSupabaseClient(): SupabaseClient {
  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  // Create and cache the client instance
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return supabaseInstance;
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use getSupabaseClient() instead
 */
export const supabase = {
  get auth() {
    return getSupabaseClient().auth;
  },
  get from() {
    return getSupabaseClient().from.bind(getSupabaseClient());
  },
  get storage() {
    return getSupabaseClient().storage;
  },
  get rpc() {
    return getSupabaseClient().rpc.bind(getSupabaseClient());
  },
};
