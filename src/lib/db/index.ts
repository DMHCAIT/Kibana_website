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

const poolConfig = {
  prepare: false,
  max: 10,
  connect_timeout: 8,
  idle_timeout: 20,
  max_lifetime: 120,
  ssl: "require",
  transform: postgres.camel,
  connection: {
    // Cancel slow statements in PostgreSQL instead of leaving them in the pool.
    statement_timeout: 10000,
    lock_timeout: 5000,
  },
} satisfies postgres.Options<Record<string, postgres.PostgresType>>;

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

globalThis.__kibana_pg = client;

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

export const db = drizzle(client, { schema });
export * as dbSchema from "./schema";
