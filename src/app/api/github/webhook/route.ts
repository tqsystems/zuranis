import { NextRequest, NextResponse } from "next/server";
import {
  validateGitHubSignature,
  calculateReleaseConfidence,
  calculateRiskLevel,
  calculateTimeToShip,
  parseFeatureCoverage,
  calculatePassRate,
  calculateRiskScore,
  generateRiskItems,
  formatMinutesToTime,
} from "@/lib/github-utils";
import {
  createRelease,
  createRiskItems,
  getOrCreateRepository,
  getOrCreateUser,
  logWebhook,
} from "@/lib/supabase-server";
import type { CoverageWebhookPayload } from "@/types/releases";

/**
 * GitHub Webhook Handler for Coverage Data
 * 
 * This endpoint receives webhook calls from GitHub Actions workflows
 * containing test coverage and release data.
 * 
 * Expected payload format: CoverageWebhookPayload
 * 
 * Security: Validates GitHub webhook signature
 * 
 * @see https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    const deliveryId = request.headers.get("x-github-delivery");
    const event = request.headers.get("x-github-event");

    console.log(`[Webhook] Received ${event} event (${deliveryId})`);

    // Validate signature
const secret = process.env.GITHUB_WEBHOOK_SECRET;
if (!validateGitHubSignature(rawBody, signature || "", secret || "")) {
  console.error("[Webhook] Invalid signature");
  
  await logWebhook({
    event_type: event || "unknown",
    delivery_id: deliveryId || undefined,
    signature: signature || undefined,
    payload: JSON.parse(rawBody),
    headers: Object.fromEntries(request.headers.entries()),
    processed: false,
    success: false,
    error_message: "Invalid webhook signature",
  });

  return NextResponse.json(
    { error: "Invalid signature" },
    { status: 401 }
  );
}    

    // Parse payload
    let payload: CoverageWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      console.error("[Webhook] Failed to parse JSON:", error);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!payload.repository || !payload.release || !payload.coverage || !payload.tests) {
      console.error("[Webhook] Missing required fields in payload");
      
      await logWebhook({
        event_type: event || "coverage",
        delivery_id: deliveryId || undefined,
        payload,
        processed: false,
        success: false,
        error_message: "Missing required fields",
      });

      return NextResponse.json(
        { error: "Missing required fields in payload" },
        { status: 400 }
      );
    }

    console.log(`[Webhook] Processing release ${payload.release.number} for ${payload.repository.full_name}`);

    // Extract data
    const { repository, release, coverage, tests, features } = payload;

    // Calculate metrics
    const coveragePercent = coverage.total;
    const passCount = tests.passed;
    const failCount = tests.failed;
    const totalTests = tests.total;

    // Calculate pass rate
    const passRate = calculatePassRate(passCount, totalTests);

    // Parse features if provided, otherwise extract from coverage
    const featureCoverage = features || parseFeatureCoverage(coverage);

    // Calculate risk score
    const riskScore = calculateRiskScore(
      coveragePercent,
      failCount,
      totalTests,
      featureCoverage
    );

    // Calculate release confidence
    const releaseConfidence = calculateReleaseConfidence(
      coveragePercent,
      passRate,
      riskScore
    );

    // Determine risk level
    const riskLevel = calculateRiskLevel(coveragePercent);

    // Calculate time to ship
    const timeToShipStr = calculateTimeToShip(coveragePercent, riskScore);
    
    // Convert time to ship to minutes
    const timeToShipMinutes = parseInt(timeToShipStr.replace(/[^\d]/g, "")) || 30;

    console.log(`[Webhook] Metrics calculated:`, {
      coverage: coveragePercent,
      confidence: releaseConfidence,
      risk: riskLevel,
      timeToShip: timeToShipStr,
    });

    // Get or create user (use repository owner)
    const user = await getOrCreateUser(
      repository.id.toString(),
      repository.owner,
      undefined,
      undefined
    );

    console.log(`[Webhook] User: ${user.github_username} (${user.id})`);

    // Get or create repository
    const repo = await getOrCreateRepository({
      github_repo_id: repository.id.toString(),
      user_id: user.id,
      repo_name: repository.name,
      owner: repository.owner,
      full_name: repository.full_name,
      default_branch: "main",
    });

    console.log(`[Webhook] Repository: ${repo.full_name} (${repo.id})`);

    // Create release record
    const releaseRecord = await createRelease({
      repo_id: repo.id,
      release_number: release.number,
      commit_sha: release.commit_sha,
      branch: release.branch,
      workflow_run_id: release.workflow_run_id,
      coverage_percent: coveragePercent,
      pass_count: passCount,
      fail_count: failCount,
      risk_score: riskScore,
      release_confidence: releaseConfidence,
      risk_level: riskLevel,
      time_to_ship_minutes: timeToShipMinutes,
      features: featureCoverage,
      raw_data: payload,
    });

    console.log(`[Webhook] Release created: ${releaseRecord.id}`);

    // Generate and create risk items
    const risks = generateRiskItems(coveragePercent, failCount, featureCoverage);
    
    if (risks.length > 0) {
      const riskRecords = risks.map((risk) => ({
        ...risk,
        release_id: releaseRecord.id,
      }));

      await createRiskItems(riskRecords);
      console.log(`[Webhook] Created ${risks.length} risk items`);
    }

    // Log successful webhook
    await logWebhook({
      event_type: event || "coverage",
      delivery_id: deliveryId || undefined,
      signature: signature || undefined,
      payload,
      processed: true,
      success: true,
      release_id: releaseRecord.id,
    });

    const duration = Date.now() - startTime;
    console.log(`[Webhook] Completed in ${duration}ms`);

    // Return success response
    return NextResponse.json({
      success: true,
      release_id: releaseRecord.id,
      metrics: {
        releaseConfidence,
        testCoverage: coveragePercent,
        riskLevel,
        timeToShip: timeToShipStr,
        passRate,
      },
      risks: risks.length,
      processing_time: duration,
    });

  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);

    // Log failed webhook
    try {
      await logWebhook({
        event_type: request.headers.get("x-github-event") || "unknown",
        delivery_id: request.headers.get("x-github-delivery") || undefined,
        payload: {},
        processed: false,
        success: false,
        error_message: error instanceof Error ? error.message : "Unknown error",
      });
    } catch (logError) {
      console.error("[Webhook] Failed to log error:", logError);
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for webhook verification
 * GitHub may send a GET request to verify the webhook endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Releason GitHub Webhook Endpoint",
    version: "1.0.0",
  });
}

