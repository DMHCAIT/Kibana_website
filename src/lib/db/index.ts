import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Use DATABASE_URL env var.
// Local dev  → direct connection (port 5432): set in .env.local
// Vercel/prod → Supabase Transaction Pooler (port 6543, pgbouncer=true): set in Vercel dashboard
// Pooler URL format: postgresql://postgres.{ref}:{password}@aws-0-{region}.pooler.supabase.com:6543/postgres
//
// IMPORTANT: On Vercel, port 5432 (direct connection) causes FUNCTION_INVOCATION_TIMEOUT
// because TCP packets to Supabase's direct server are silently dropped.
// We only enable DB on Vercel when the pooler URL (port 6543) is configured.
const rawUrl = process.env.DATABASE_URL;
const isVercel = process.env.VERCEL === "1";
const connectionString = isVercel && rawUrl && !rawUrl.includes(":6543") ? undefined : rawUrl;

declare global {
  // eslint-disable-next-line no-var
  var __kibana_pg: ReturnType<typeof postgres> | undefined;
  var __kibana_db_health: {
    lastCheck: number;
    isHealthy: boolean;
    reconnectAttempts: number;
  };
}

// Connection pool configuration with enhanced reliability
const poolConfig = {
  prepare: false, // Required for serverless
  max: 10, // Increased for better concurrency (was 5)
  connect_timeout: 15, // Increased timeout for reliable connection
  idle_timeout: 20, // Keep connections alive longer
  max_lifetime: 120, // Extended lifetime for stability
  ssl: "require", // Always require SSL for Supabase
  transform: postgres.camel, // Auto-convert snake_case to camelCase
  // Connection recovery
  onconnect: async (connection: any) => {
    console.log("📡 Database connection established");
    globalThis.__kibana_db_health = {
      lastCheck: Date.now(),
      isHealthy: true,
      reconnectAttempts: 0,
    };
  },
  onerror: (error: Error) => {
    console.error("❌ Database connection error:", error.message);
    if (globalThis.__kibana_db_health) {
      globalThis.__kibana_db_health.isHealthy = false;
      globalThis.__kibana_db_health.reconnectAttempts += 1;
    }
  },
} as any;

const client =
  globalThis.__kibana_pg ?? postgres(connectionString ?? "postgres://invalid", poolConfig);

// Initialize health tracking
if (!globalThis.__kibana_db_health) {
  globalThis.__kibana_db_health = {
    lastCheck: Date.now(),
    isHealthy: true,
    reconnectAttempts: 0,
  };
}

if (process.env.NODE_ENV !== "production") globalThis.__kibana_pg = client;

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  if (!client) return false;

  try {
    await client`SELECT NOW()`;
    if (globalThis.__kibana_db_health) {
      globalThis.__kibana_db_health.isHealthy = true;
      globalThis.__kibana_db_health.lastCheck = Date.now();
      globalThis.__kibana_db_health.reconnectAttempts = 0;
    }
    return true;
  } catch (error) {
    console.error("🚨 Database health check failed:", error);
    if (globalThis.__kibana_db_health) {
      globalThis.__kibana_db_health.isHealthy = false;
      globalThis.__kibana_db_health.lastCheck = Date.now();
      globalThis.__kibana_db_health.reconnectAttempts += 1;
    }
    return false;
  }
}

// Periodic health check (every 30 seconds in development)
if (process.env.NODE_ENV !== "production") {
  setInterval(async () => {
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      console.warn("⚠️  Database connection unhealthy. Attempting recovery...");
      try {
        // Try to reconnect
        await client`SELECT NOW()`;
        console.log("✅ Database connection recovered");
      } catch (error) {
        console.error("❌ Database reconnection failed:", error);
      }
    }
  }, 30000); // Check every 30 seconds
}

export const db = drizzle(client, { schema });
export * as dbSchema from "./schema";
