"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";
import { PASSWORD_HINT, validatePassword } from "@/lib/password";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);

    if (updateError) {
      setError(
        updateError.message.includes("session")
          ? "Reset link expired or invalid. Request a new one from Forgot password."
          : updateError.message,
      );
      return;
    }

    await supabase.auth.signOut();
    router.push("/login?registered=1");
    router.refresh();
  }

  return (
    <AuthSplitLayout mode="reset">
      <p className="section-label">Account</p>
      <h2 className="mt-2 font-display text-2xl font-bold text-ink">
        Set new password
      </h2>
      <p className="mt-2 text-sm text-slate">
        Choose a new password for your account, then sign in.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="label" htmlFor="password">
            New password
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
        <div>
          <label className="label" htmlFor="confirm">
            Confirm password
          </label>
          <input
            id="confirm"
            className="input"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-teal">{error}</p> : null}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Saving…" : "Update password"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate">
        <Link href="/forgot-password" className="font-semibold text-teal">
          Request a new reset link
        </Link>
        {" · "}
        <Link href="/login" className="font-semibold text-teal">
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
