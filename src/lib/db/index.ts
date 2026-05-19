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
const connectionString =
  isVercel && rawUrl && !rawUrl.includes(":6543") ? undefined : rawUrl;

declare global {
  // eslint-disable-next-line no-var
  var __kibana_pg: ReturnType<typeof postgres> | undefined;
}

const client =
  globalThis.__kibana_pg ??
  postgres(connectionString ?? "postgres://invalid", {
    prepare: false,          // Required for serverless
    max: 1,                  // Keep connections low on serverless
    connect_timeout: 2,      // Fail fast — 2s max per connection attempt
    idle_timeout: 10,
    max_lifetime: 60,
    max_retries: 0,          // No retries — fail immediately on connection error
    ssl: "require",          // Always require SSL for Supabase
  });

if (process.env.NODE_ENV !== "production") globalThis.__kibana_pg = client;

export const db = drizzle(client, { schema });
export * as dbSchema from "./schema";
