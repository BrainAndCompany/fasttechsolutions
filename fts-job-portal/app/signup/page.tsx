"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";
import { PASSWORD_HINT, validatePassword } from "@/lib/password";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const localError = validatePassword(password);
    if (localError) {
      setLoading(false);
      setError(localError);
      return;
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        fullName,
        phone,
      }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);

    if (res.ok) {
      const params = new URLSearchParams({
        registered: "1",
        email: email.trim().toLowerCase(),
        next,
      });
      router.push(`/login?${params.toString()}`);
      router.refresh();
      return;
    }

    const msg = String(body.error || "Could not create account");
    if (body.code === "already_registered") {
      setError(msg);
      return;
    }
    if (body.code === "phone_taken") {
      setError(msg);
      return;
    }
    if (/security purposes|only request this after/i.test(msg)) {
      setError(
        "Too many attempts — wait about a minute, then try again or sign in if you already registered.",
      );
      return;
    }

    setError(msg);
  }

  return (
    <AuthSplitLayout mode="signup">
      <p className="section-label">Account</p>
      <h2 className="mt-2 font-display text-2xl font-bold text-ink">
        Create account
      </h2>
      <p className="mt-2 text-sm text-slate">
        One account per email and phone. Register to apply and track
        applications.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="label" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            className="input"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
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
          <label className="label" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            className="input"
            type="tel"
            required
            autoComplete="tel"
            placeholder="+966…"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="input"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-slate">{PASSWORD_HINT}</p>
        </div>
        {error ? (
          <div className="space-y-2 border border-line bg-mist px-3 py-2 text-sm text-teal">
            <p>{error}</p>
            {/already registered/i.test(error) ? (
              <p className="text-slate">
                <Link
                  href={`/login?email=${encodeURIComponent(email.trim().toLowerCase())}&next=${encodeURIComponent(next)}`}
                  className="font-semibold text-teal"
                >
                  Sign in
                </Link>
                {" · "}
                <Link
                  href={`/forgot-password?email=${encodeURIComponent(email.trim().toLowerCase())}`}
                  className="font-semibold text-teal"
                >
                  Forgot password
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate">
        Already registered?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-semibold text-teal"
        >
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
