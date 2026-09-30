import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseUrlAndAnonKey } from "@/lib/supabase/public-env";

export function createBrowserSupabaseClient() {
  const env = getSupabaseUrlAndAnonKey();
  if (!env) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / publishable key");
  }
  return createBrowserClient(env.url, env.anonKey);
}
