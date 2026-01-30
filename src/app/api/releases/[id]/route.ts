import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getReleaseById, getRisks, getOrCreateUser } from "@/lib/supabase-server";
import type { ReleaseDetailResponse, ReleaseMetrics } from "@/types/releases";
import { formatMinutesToTime } from "@/lib/github-utils";

/**
 * GET /api/releases/[id]
 * 
 * Fetch a specific release by ID with full details
 * 
 * Params:
 * - id: Release UUID
 * 
 * Returns:
 * - release: Full release data
 * - risks: Array of risk items
 * - repository: Repository information
 * - metrics: Formatted metrics
 * 
 * Auth: Required
 * Security: Verifies user owns this release
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const releaseId = params.id;

    console.log(`[API] Fetching release ${releaseId} for user ${session.user.email}`);

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(releaseId)) {
      return NextResponse.json(
        { error: "Invalid release ID format" },
        { status: 400 }
      );
    }

    // Get or create user
    const user = await getOrCreateUser(
      session.user.id,
      session.user.login || session.user.name || "unknown",
      session.user.email || undefined,
      session.user.image || undefined
    );

    // Fetch release with repository information
    const release = await getReleaseById(releaseId);

    if (!release) {
      console.log(`[API] Release not found: ${releaseId}`);
      return NextResponse.json(
        { error: "Release not found" },
        { status: 404 }
      );
    }

    // Verify user owns this release (security check)
    const repository = (release as any).repositories;
    if (!repository || repository.user_id !== user.id) {
      console.warn(`[API] Unauthorized access attempt to release ${releaseId} by user ${user.id}`);
      return NextResponse.json(
        { error: "Forbidden: You don't have access to this release" },
        { status: 403 }
      );
    }

    // Fetch associated risks
    const risks = await getRisks(releaseId);

    // Format metrics
    const metrics: ReleaseMetrics = {
      releaseConfidence: release.release_confidence,
      testCoverage: release.coverage_percent,
      riskLevel: release.risk_level,
      timeToShip: formatMinutesToTime(release.time_to_ship_minutes),
      passRate: release.total_tests
        ? Math.round((release.pass_count / release.total_tests) * 100 * 100) / 100
        : 0,
      totalTests: release.total_tests || release.pass_count + release.fail_count,
      failedTests: release.fail_count,
    };

    const response: ReleaseDetailResponse = {
      release,
      risks,
      repository,
      metrics,
    };

    console.log(`[API] Returning release ${release.release_number} with ${risks.length} risks`);

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate", // 5 minutes
      },
    });

  } catch (error) {
    console.error("[API] Error fetching release:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
