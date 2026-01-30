import { createClient } from "@supabase/supabase-js";
import type {
  Release,
  RiskItem,
  Repository,
  User,
  FeatureCoverage,
} from "@/types/releases";

/**
 * Create a Supabase server client with service role key
 * Uses lazy initialization to avoid build-time errors
 * 
 * @returns Supabase client instance
 * @throws Error if environment variables are not set
 */
function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create a new release in the database
 * 
 * @param data - Release data to insert
 * @returns Created release object
 */
export async function createRelease(data: {
  repo_id: string;
  release_number: string;
  commit_sha?: string;
  branch?: string;
  workflow_run_id?: string;
  coverage_percent: number;
  pass_count: number;
  fail_count: number;
  risk_score: number;
  release_confidence: number;
  risk_level: "Critical" | "High" | "Medium" | "Low";
  time_to_ship_minutes: number;
  features?: FeatureCoverage[];
  raw_data?: any;
}): Promise<Release> {
  const supabase = getSupabaseServer();
  
  const { data: release, error } = await supabase
    .from("releases")
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("Error creating release:", error);
    throw new Error(`Failed to create release: ${error.message}`);
  }

  return release;
}

/**
 * Update an existing release
 * 
 * @param id - Release ID
 * @param data - Fields to update
 * @returns Updated release object
 */
export async function updateRelease(
  id: string,
  data: Partial<Release>
): Promise<Release> {
  const supabase = getSupabaseServer();
  
  const { data: release, error } = await supabase
    .from("releases")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating release:", error);
    throw new Error(`Failed to update release: ${error.message}`);
  }

  return release;
}

/**
 * Get a release by ID
 * 
 * @param id - Release ID
 * @returns Release object or null
 */
export async function getReleaseById(id: string): Promise<Release | null> {
  const supabase = getSupabaseServer();
  
  const { data: release, error } = await supabase
    .from("releases")
    .select("*, repositories(*)")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    console.error("Error fetching release:", error);
    throw new Error(`Failed to fetch release: ${error.message}`);
  }

  return release;
}

/**
 * Get the latest release for a user
 * 
 * @param userId - User ID
 * @returns Latest release or null
 */
export async function getLatestRelease(userId: string): Promise<Release | null> {
  const supabase = getSupabaseServer();
  
  const { data: release, error } = await supabase
    .from("releases")
    .select(`
      *,
      repositories!inner(*)
    `)
    .eq("repositories.user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No releases found
      return null;
    }
    console.error("Error fetching latest release:", error);
    throw new Error(`Failed to fetch latest release: ${error.message}`);
  }

  return release;
}

/**
 * Get all releases for a user with pagination
 * 
 * @param userId - User ID
 * @param limit - Number of releases to fetch (default: 20)
 * @param offset - Offset for pagination (default: 0)
 * @returns Array of releases
 */
export async function getAllReleases(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Release[]> {
  const supabase = getSupabaseServer();
  
  const { data: releases, error } = await supabase
    .from("releases")
    .select(`
      *,
      repositories!inner(*)
    `)
    .eq("repositories.user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching releases:", error);
    throw new Error(`Failed to fetch releases: ${error.message}`);
  }

  return releases || [];
}

/**
 * Get risk items for a release
 * 
 * @param releaseId - Release ID
 * @returns Array of risk items
 */
export async function getRisks(releaseId: string): Promise<RiskItem[]> {
  const supabase = getSupabaseServer();
  
  const { data: risks, error } = await supabase
    .from("risk_items")
    .select("*")
    .eq("release_id", releaseId)
    .order("severity", { ascending: false });

  if (error) {
    console.error("Error fetching risks:", error);
    throw new Error(`Failed to fetch risks: ${error.message}`);
  }

  return risks || [];
}

/**
 * Create a new risk item
 * 
 * @param data - Risk item data
 * @returns Created risk item
 */
export async function createRiskItem(data: {
  release_id: string;
  risk_name: string;
  risk_level: "High" | "Medium" | "Low" | "Info";
  severity: number;
  description: string;
  affected_feature?: string;
  recommendation?: string;
  auto_generated?: boolean;
}): Promise<RiskItem> {
  const supabase = getSupabaseServer();
  
  const { data: risk, error } = await supabase
    .from("risk_items")
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("Error creating risk item:", error);
    throw new Error(`Failed to create risk item: ${error.message}`);
  }

  return risk;
}

/**
 * Create multiple risk items at once
 * 
 * @param risks - Array of risk items to create
 * @returns Array of created risk items
 */
export async function createRiskItems(
  risks: Array<{
    release_id: string;
    risk_name: string;
    risk_level: "High" | "Medium" | "Low" | "Info";
    severity: number;
    description: string;
    affected_feature?: string;
    recommendation?: string;
    auto_generated?: boolean;
  }>
): Promise<RiskItem[]> {
  if (risks.length === 0) return [];

  const supabase = getSupabaseServer();
  
  const { data: createdRisks, error } = await supabase
    .from("risk_items")
    .insert(risks)
    .select();

  if (error) {
    console.error("Error creating risk items:", error);
    throw new Error(`Failed to create risk items: ${error.message}`);
  }

  return createdRisks || [];
}

/**
 * Get or create a repository
 * 
 * @param data - Repository data
 * @returns Repository object
 */
export async function getOrCreateRepository(data: {
  repo_id: string;
  user_id: string;
  repo_name: string;
  owner: string;
  full_name: string;
  default_branch?: string;
}): Promise<Repository> {
  const supabase = getSupabaseServer();
  
  // Try to get existing repository
  const { data: existing } = await supabase
    .from("repositories")
    .select("*")
    .eq("repo_id", data.repo_id)
    .single();

  if (existing) {
    return existing;
  }

  // Create new repository
  const { data: repo, error } = await supabase
    .from("repositories")
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("Error creating repository:", error);
    throw new Error(`Failed to create repository: ${error.message}`);
  }

  return repo;
}

/**
 * Get or create a user by GitHub ID
 * 
 * @param githubId - GitHub user ID
 * @param githubUsername - GitHub username
 * @param email - User email (optional)
 * @param avatarUrl - Avatar URL (optional)
 * @returns User object
 */
export async function getOrCreateUser(
  githubId: string,
  githubUsername: string,
  email?: string,
  avatarUrl?: string
): Promise<User> {
  const supabase = getSupabaseServer();
  
  // Try to get existing user
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("github_id", githubId)
    .single();

  if (existing) {
    // Update user info if provided
    if (email || avatarUrl) {
      const updates: any = {};
      if (email) updates.email = email;
      if (avatarUrl) updates.avatar_url = avatarUrl;

      const { data: updated } = await supabase
        .from("users")
        .update(updates)
        .eq("id", existing.id)
        .select()
        .single();

      return updated || existing;
    }
    return existing;
  }

  // Create new user
  const { data: user, error } = await supabase
    .from("users")
    .insert([
      {
        github_id: githubId,
        github_username: githubUsername,
        email,
        avatar_url: avatarUrl,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return user;
}

/**
 * Get repository by repo_id
 * 
 * @param repoId - Repository ID
 * @returns Repository or null
 */
export async function getRepositoryByRepoId(
  repoId: string
): Promise<Repository | null> {
  const supabase = getSupabaseServer();
  
  const { data: repo, error } = await supabase
    .from("repositories")
    .select("*")
    .eq("repo_id", repoId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching repository:", error);
    throw new Error(`Failed to fetch repository: ${error.message}`);
  }

  return repo;
}

/**
 * Count total releases for a user
 * 
 * @param userId - User ID
 * @returns Total count
 */
export async function countUserReleases(userId: string): Promise<number> {
  const supabase = getSupabaseServer();
  
  const { count, error } = await supabase
    .from("releases")
    .select("*", { count: "exact", head: true })
    .eq("repositories.user_id", userId);

  if (error) {
    console.error("Error counting releases:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Log webhook delivery
 * 
 * @param data - Webhook log data
 */
export async function logWebhook(data: {
  event_type: string;
  delivery_id?: string;
  signature?: string;
  payload: any;
  headers?: any;
  processed: boolean;
  success: boolean;
  error_message?: string;
  release_id?: string;
}): Promise<void> {
  try {
    const supabase = getSupabaseServer();
    
    const { error } = await supabase
      .from("webhook_logs")
      .insert([data]);

    if (error) {
      console.error("Error logging webhook:", error);
      // Don't throw - logging failures shouldn't break the webhook
    }
  } catch (error) {
    console.error("Error initializing Supabase for webhook logging:", error);
    // Don't throw - logging failures shouldn't break the webhook
  }
}
