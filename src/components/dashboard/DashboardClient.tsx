"use client";

import { useEffect, useState, useCallback } from "react";
import type { LatestReleaseResponse } from "@/types/releases";
import { ReleaseOverview } from "./ReleaseOverview";
import { MetricsGrid } from "./MetricsGrid";
import { CoverageByFeature } from "./CoverageByFeature";
import { RiskSummary } from "./RiskSummary";
import { FiRefreshCw, FiAlertCircle } from "react-icons/fi";

interface DashboardClientProps {
  user: {
    name?: string | null;
    login?: string | null;
    email?: string | null;
  };
}

export function DashboardClient({ user }: DashboardClientProps) {
  const [data, setData] = useState<LatestReleaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch("/api/releases/latest", {
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError("no_releases");
          return;
        }
        throw new Error(`Failed to fetch release data: ${response.statusText}`);
      }

      const result: LatestReleaseResponse = await response.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name || user.login || "User"}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Loading your release confidence overview...
          </p>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#667eea] border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  // No releases state
  if (error === "no_releases") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to Releason, {user.name || user.login || "User"}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Get started by setting up your first release
          </p>
        </div>

        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] p-4">
              <FiAlertCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              No Releases Yet
            </h2>
            <p className="mb-8 text-gray-600">
              Your dashboard will display release confidence metrics once you push
              code with GitHub Actions configured. Set up your workflow to start
              tracking coverage and release confidence.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a
                href="/docs/GITHUB_ACTIONS_SETUP.md"
                target="_blank"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] px-6 py-3 text-base font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                View Setup Guide
              </a>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center justify-center rounded-lg border-2 border-[#667eea] px-6 py-3 text-base font-medium text-[#667eea] transition-all hover:bg-[#667eea] hover:text-white"
              >
                <FiRefreshCw className="mr-2 h-5 w-5" />
                Check Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name || user.login || "User"}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            There was an error loading your data
          </p>
        </div>

        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-8 text-center">
          <FiAlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
          <h3 className="mb-2 text-lg font-semibold text-red-900">
            Error Loading Dashboard
          </h3>
          <p className="mb-4 text-sm text-red-700">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Success state with data
  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name || user.login || "User"}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here&apos;s your release confidence overview
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 ${
            refreshing ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Refresh data"
        >
          <FiRefreshCw
            className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Release Overview - Large Hero Section */}
      <ReleaseOverview
        confidenceScore={data.metrics.releaseConfidence}
        riskLevel={data.release.risk_level}
        releaseNumber={data.release.release_number}
        releaseDate={new Date(data.release.created_at).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric", year: "numeric" }
        )}
        timeToShip={data.metrics.timeToShip}
        recommendation={generateRecommendation(data)}
      />

      {/* Metrics Grid - 4 Cards */}
      <MetricsGrid
        releaseConfidence={data.metrics.releaseConfidence}
        testCoverage={data.metrics.testCoverage}
        riskLevel={data.release.risk_level}
        timeToShip={data.metrics.timeToShip}
        passRate={data.metrics.passRate || 0}
      />

      {/* Two Column Layout for Coverage and Risk */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coverage by Feature Table */}
        <CoverageByFeature features={data.release.features || []} />

        {/* Risk Summary */}
        <RiskSummary risks={data.risks} />
      </div>

      {/* Last updated indicator */}
      <div className="text-center text-xs text-gray-500">
        Last updated: {new Date(data.release.updated_at).toLocaleString()}
        <span className="mx-2">•</span>
        Auto-refreshes every 30 seconds
      </div>
    </div>
  );
}

/**
 * Generate recommendation text based on release data
 */
function generateRecommendation(data: LatestReleaseResponse): string {
  const { release, risks } = data;
  const highRisks = risks.filter((r) => r.risk_level === "High");

  if (highRisks.length > 0) {
    const riskNames = highRisks.map((r) => r.risk_name).join(", ");
    return `High priority: Address ${highRisks.length} critical issue(s) (${riskNames}) before deploying to production. Estimated time to ship: ${data.metrics.timeToShip}`;
  }

  if (release.risk_level === "Medium") {
    return `Release confidence is good, but consider improving test coverage for better confidence. Estimated time to ship: ${data.metrics.timeToShip}`;
  }

  if (release.risk_level === "Low") {
    return `All systems go! Release confidence is excellent. You're ready to ship. Estimated time to ship: ${data.metrics.timeToShip}`;
  }

  return `Review the risk summary below before proceeding with deployment. Estimated time to ship: ${data.metrics.timeToShip}`;
}
