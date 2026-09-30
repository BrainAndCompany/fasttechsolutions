"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";

function ForgotForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);

    if (res.ok) {
      setSuccess(
        String(body.message || "Password reset link sent. Check your email."),
      );
      return;
    }

    setError(String(body.error || "Could not send reset email."));
  }

  return (
    <AuthSplitLayout mode="forgot">
      <p className="section-label">Account</p>
      <h2 className="mt-2 font-display text-2xl font-bold text-ink">
        Forgot password
      </h2>
      <p className="mt-2 text-sm text-slate">
        We send a reset link only if this email is already registered on the
        portal.
      </p>
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
        {error ? (
          <div className="space-y-2 border border-line bg-mist px-3 py-2 text-sm text-teal">
            <p>{error}</p>
            {/no account|not registered|create an account/i.test(error) ? (
              <p>
                <Link href="/signup" className="font-semibold text-teal">
                  Create account
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}
        {success ? (
          <p className="border border-line bg-mist px-3 py-2 text-sm text-teal">
            {success}
          </p>
        ) : null}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-teal">
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotForm />
    </Suspense>
  );
}
