import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Lazy Neon client — defers initialization until the first SQL call.
//
// WHY: The old pattern `if (!DATABASE_URL) throw` fires at module-load time.
// Next.js evaluates the full server-side module graph during SSR, so any
// module-level throw escapes React error boundaries and kills the render.
// By deferring to the first actual query, we let the error surface in the
// normal server-action error path where it belongs.

let _sql: NeonQueryFunction<false, false> | undefined;

function getSQL(): NeonQueryFunction<false, false> {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.local.example to .env.local and fill in your Neon connection string."
    );
  }
  _sql = neon(url);
  return _sql;
}

// Exported as a tagged-template function — all existing call sites (sql`...`) work unchanged.
export const sql: NeonQueryFunction<false, false> = (
  (...args: Parameters<NeonQueryFunction<false, false>>) => getSQL()(...args)
) as NeonQueryFunction<false, false>;
