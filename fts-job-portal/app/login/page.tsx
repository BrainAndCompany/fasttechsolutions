"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const registered = searchParams.get("registered") === "1";
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setLoading(false);
      const msg = authError.message;
      if (/security purposes|only request this after/i.test(msg)) {
        setError("Too many attempts — wait about a minute, then try again.");
      } else if (/email not confirmed|confirm/i.test(msg)) {
        setError(
          "Confirm your email first — check your inbox for the link from HR.",
        );
      } else {
        setError(msg);
      }
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    let dest = next;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      const hr = profile?.role === "hr" || profile?.role === "admin";
      if (hr && (next === "/dashboard" || next === "/")) dest = "/hr";
      if (!hr && next.startsWith("/hr")) dest = "/dashboard";
    }
    setLoading(false);
    router.push(dest);
    router.refresh();
  }

  return (
    <AuthSplitLayout mode="login">
      <p className="section-label">Account</p>
      <h2 className="mt-2 font-display text-2xl font-bold text-ink">Sign in</h2>
      {registered ? (
        <p className="mt-3 border border-line bg-mist px-3 py-2 text-sm text-teal">
          Account created. Confirm your email if asked, then sign in.
        </p>
      ) : (
        <p className="mt-2 text-sm text-slate">
          Access your applications or the HR console.
        </p>
      )}
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="label !mb-0" htmlFor="password">
              Password
            </label>
            <Link
              href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
              className="text-xs font-semibold text-teal"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            className="input"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-teal">{error}</p> : null}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate">
        No account?{" "}
        <Link
          href={`/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-teal"
        >
          Create one
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
