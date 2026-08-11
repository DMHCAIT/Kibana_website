import { checkDatabaseHealth } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * Database health check endpoint
 * GET /api/health
 *
 * Returns:
 * {
 *   status: "healthy" | "degraded" | "unhealthy",
 *   database: boolean,
 *   lastCheck: timestamp,
 *   reconnectAttempts: number
 * }
 */
export async function GET() {
  try {
    const isHealthy = await checkDatabaseHealth();

    return NextResponse.json({
      status: isHealthy ? "healthy" : "unhealthy",
      database: isHealthy,
      timestamp: new Date().toISOString(),
      checks: {
        database: isHealthy ? "✅ Connected" : "❌ Disconnected",
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        database: false,
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
