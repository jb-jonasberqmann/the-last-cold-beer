import { neon } from "@neondatabase/serverless";

// Single Neon SQL client — works in both server components and server actions.
// Uses the tagged-template literal API: sql`SELECT * FROM games WHERE id = ${id}`
// Results are plain JS objects typed by the caller.

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.local.example to .env.local and fill in your Neon connection string.");
}

export const sql = neon(process.env.DATABASE_URL);
