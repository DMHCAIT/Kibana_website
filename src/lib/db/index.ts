import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Use DATABASE_URL env var.
// Local dev  → direct connection (port 5432): set in .env.local
// Vercel/prod → Supabase Transaction Pooler (port 6543, pgbouncer=true): set in Vercel dashboard
// Pooler URL format: postgresql://postgres.{ref}:{password}@aws-0-{region}.pooler.supabase.com:6543/postgres
const connectionString = process.env.DATABASE_URL;

declare global {
  // eslint-disable-next-line no-var
  var __kibana_pg: ReturnType<typeof postgres> | undefined;
}

const client =
  globalThis.__kibana_pg ??
  postgres(connectionString ?? "postgres://invalid", {
    prepare: false,          // Required for serverless
    max: 1,                  // Keep connections low on serverless
    connect_timeout: 10,
    idle_timeout: 20,
    ssl: "require",          // Always require SSL for Supabase
  });

if (process.env.NODE_ENV !== "production") globalThis.__kibana_pg = client;

export const db = drizzle(client, { schema });
export * as dbSchema from "./schema";
