import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Supabase exposes a Postgres connection string via the dashboard.
// Use the "Transaction" pooler URL in serverless/edge environments.
const connectionString = process.env.DATABASE_URL;

declare global {
  // eslint-disable-next-line no-var
  var __kibana_pg: ReturnType<typeof postgres> | undefined;
}

const client =
  globalThis.__kibana_pg ??
  postgres(connectionString ?? "postgres://invalid", {
    prepare: false,
    max: 1,
    connect_timeout: 5,
    idle_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") globalThis.__kibana_pg = client;

export const db = drizzle(client, { schema });
export * as dbSchema from "./schema";
