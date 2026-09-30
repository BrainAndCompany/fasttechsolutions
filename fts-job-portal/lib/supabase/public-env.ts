/**
 * Resolves Supabase URL + public API key for middleware, SSR, and browser.
 */
export function getSupabaseUrlAndAnonKey():
  | { url: string; anonKey: string }
  | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "";
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function getSupabaseProjectUrl(): string | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    "";
  return url || null;
}

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.JOB_PORTAL_PUBLIC_URL?.trim() ||
    "http://localhost:3001"
  );
}
