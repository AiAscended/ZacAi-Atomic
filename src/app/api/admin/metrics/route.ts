/**
 * Admin Metrics API
 *
 * Real-time system performance metrics for admin dashboard
 */

import { NextRequest, NextResponse } from "next/server";
import { enhancedMetricsCollector } from "@/ai/monitoring/enhancedMetricsCollector";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/metrics
 * Get comprehensive system metrics
 */
export async function GET() {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";

    switch (type) {
      case "system":
        return NextResponse.json({
          success: true,
          data: enhancedMetricsCollector.getSystemMetrics(),
        });

      case "domains":
        return NextResponse.json({
          success: true,
          data: enhancedMetricsCollector.getDomainMetrics(),
        });

      case "models":
        return NextResponse.json({
          success: true,
          data: enhancedMetricsCollector.getModelMetrics(),
        });

      case "health":
        return NextResponse.json({
          success: true,
          data: enhancedMetricsCollector.getHealthStatus(),
        });

      case "export":
        return NextResponse.json({
          success: true,
          data: enhancedMetricsCollector.exportMetrics(),
        });

      case "all":
      default:
        return NextResponse.json({
          success: true,
          data: {
            system: enhancedMetricsCollector.getSystemMetrics(),
            domains: enhancedMetricsCollector.getDomainMetrics(),
            models: enhancedMetricsCollector.getModelMetrics(),
            health: enhancedMetricsCollector.getHealthStatus(),
          },
        });
    }
  } catch (error) {
    console.error("[Admin Metrics API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve metrics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    enhancedMetricsCollector.clear();

    return NextResponse.json({
      success: true,
      message: "Metrics cleared successfully",
    });
  } catch (error) {
    console.error("[Admin Metrics API] Error clearing metrics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear metrics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
