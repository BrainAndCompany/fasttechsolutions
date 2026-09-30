import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function appOrigin() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://jobs.fts-ksa.com"
  );
}

/**
 * Sends a password-reset email only if the email is already registered.
 * Unregistered addresses get no email.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email || "")
    .trim()
    .toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    return NextResponse.json(
      { error: "Server auth is not configured." },
      { status: 500 },
    );
  }

  const supabase = createClient(url, key);

  const { data: registered, error: rpcError } = await supabase.rpc(
    "is_email_registered",
    { p_email: email },
  );

  if (rpcError) {
    return NextResponse.json(
      { error: "Could not verify account. Try again shortly." },
      { status: 500 },
    );
  }

  if (registered !== true) {
    return NextResponse.json(
      {
        error:
          "No account found with this email. Create an account first, then you can reset your password.",
        code: "not_registered",
      },
      { status: 404 },
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appOrigin()}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });

  if (error) {
    if (/security purposes|only request this after/i.test(error.message)) {
      return NextResponse.json(
        {
          error: "Too many attempts — wait about a minute, then try again.",
          code: "rate_limited",
        },
        { status: 429 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Password reset link sent. Check your email inbox (and spam).",
  });
}
