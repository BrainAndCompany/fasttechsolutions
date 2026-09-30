import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validatePassword } from "@/lib/password";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

function appOrigin() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://jobs.fts-ksa.com"
  );
}

/** Candidate signup only — HR roles are assigned in SQL by admins. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password || !body?.fullName || !body?.phone) {
    return NextResponse.json(
      { error: "Name, email, phone, and password are required." },
      { status: 400 },
    );
  }

  const email = String(body.email).trim().toLowerCase();
  const password = String(body.password);
  const fullName = String(body.fullName).trim();
  const phone = normalizePhone(String(body.phone));

  if (!fullName) {
    return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json(
      { error: "Enter a valid phone number (8–15 digits)." },
      { status: 400 },
    );
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError, code: "weak_password" }, { status: 400 });
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

  const anon = createClient(url, key);

  const { data: emailTaken } = await anon.rpc("is_email_registered", {
    p_email: email,
  });
  if (emailTaken === true) {
    return NextResponse.json(
      {
        error:
          "This email is already registered. Sign in or use Forgot password.",
        code: "already_registered",
      },
      { status: 409 },
    );
  }

  const { data: phoneTaken } = await anon.rpc("is_phone_registered", {
    p_phone: phone,
  });
  if (phoneTaken === true) {
    return NextResponse.json(
      {
        error: "This phone number is already registered to another account.",
        code: "phone_taken",
      },
      { status: 409 },
    );
  }

  const { data, error } = await anon.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role: "candidate", phone },
      emailRedirectTo: `${appOrigin()}/auth/callback?next=/login`,
    },
  });

  if (error) {
    const msg = error.message;
    if (/already|registered|exists/i.test(msg)) {
      return NextResponse.json(
        {
          error:
            "This email is already registered. Sign in or use Forgot password.",
          code: "already_registered",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Confirm-email ON: existing users get a fake user with empty identities
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    return NextResponse.json(
      {
        error:
          "This email is already registered. Sign in or use Forgot password.",
        code: "already_registered",
      },
      { status: 409 },
    );
  }

  if (data.user) {
    const admin = createServiceSupabaseClient();
    const client = admin ?? anon;
    const { error: profileError } = await client.from("profiles").upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      phone,
      role: "candidate",
    });

    if (profileError) {
      if (/phone|unique|duplicate/i.test(profileError.message)) {
        return NextResponse.json(
          {
            error:
              "This phone number is already registered to another account.",
            code: "phone_taken",
          },
          { status: 409 },
        );
      }
      if (/email|unique|duplicate/i.test(profileError.message)) {
        return NextResponse.json(
          {
            error:
              "This email is already registered. Sign in or use Forgot password.",
            code: "already_registered",
          },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    role: "candidate",
    message:
      "Account created. Check your email to confirm, then sign in.",
  });
}
