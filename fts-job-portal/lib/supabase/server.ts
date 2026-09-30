import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  getSupabaseProjectUrl,
  getSupabaseUrlAndAnonKey,
} from "@/lib/supabase/public-env";

export async function createServerSupabaseClient() {
  const env = getSupabaseUrlAndAnonKey();
  if (!env) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / publishable key");
  }
  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* Server Component */
        }
      },
    },
  });
}

/** Service-role client — bypasses RLS. Only use on the server. */
export function createServiceSupabaseClient() {
  const url = getSupabaseProjectUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
