import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Email confirm / OAuth callback — lands on the job portal after Supabase Auth.
 * Set Supabase Site URL to https://jobs.fts-ksa.com (and redirect URLs to include
 * https://jobs.fts-ksa.com/auth/callback).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "";

  if (code && url && anonKey) {
    const cookieStore = await cookies();
    const supabase = createServerClient(url, anonKey, {
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
            /* ignore */
          }
        },
      },
    });
    await supabase.auth.exchangeCodeForSession(code);
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || origin;
  return NextResponse.redirect(new URL(next, appUrl));
}
