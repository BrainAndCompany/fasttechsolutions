"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { JobQuestion, Profile } from "@/lib/types";
import { EMPLOYMENT_STATUS_LABELS } from "@/lib/types";

export function ApplyForm({
  jobId,
  jobSlug,
  jobTitle,
  profile,
  questions,
}: {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
  profile: Profile;
  questions: JobQuestion[];
}) {
  const router = useRouter();
  const [coverNote, setCoverNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const q of questions) init[q.id] = "";
    return init;
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Please attach your CV (PDF or Word).");
      return;
    }
    for (const q of questions) {
      if (q.required && !String(answers[q.id] || "").trim()) {
        setError(`Please answer: ${q.prompt}`);
        return;
      }
    }
    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError("Please sign in again.");
      return;
    }

    const ext = file.name.split(".").pop() || "pdf";
    const path = `${user.id}/${jobId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) {
      setLoading(false);
      setError(uploadError.message);
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("applications")
      .insert({
        job_id: jobId,
        user_id: user.id,
        cover_note: coverNote || null,
        cv_path: path,
        cv_file_name: file.name,
        status: "submitted",
      })
      .select("id")
      .single();

    if (insertError) {
      setLoading(false);
      setError(
        insertError.message.includes("duplicate")
          ? "You already applied to this role."
          : insertError.message,
      );
      return;
    }

    if (inserted?.id) {
      if (questions.length) {
        const answerRows = questions.map((q) => ({
          application_id: inserted.id,
          question_id: q.id,
          answer_text: String(answers[q.id] || "").trim(),
        }));
        const { error: answerError } = await supabase
          .from("application_answers")
          .insert(answerRows);
        if (answerError) {
          setLoading(false);
          setError(answerError.message);
          return;
        }
      }

      await supabase.from("application_events").insert({
        application_id: inserted.id,
        from_status: null,
        to_status: "submitted",
        changed_by: user.id,
        note: "Application submitted",
      });
      try {
        await fetch("/api/applications/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId: inserted.id }),
        });
      } catch {
        /* email failure must not block apply */
      }
    }

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <p className="text-sm text-slate">
          Applying for <strong className="text-ink">{jobTitle}</strong>
        </p>
      </div>

      <div className="border border-line bg-mist px-4 py-4 text-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="font-semibold text-ink">Your profile</p>
          <Link
            href={`/profile?next=${encodeURIComponent(`/apply/${jobSlug}`)}`}
            className="text-xs font-semibold text-teal"
          >
            Edit profile
          </Link>
        </div>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate">Name</dt>
            <dd className="text-ink">{profile.full_name || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate">Phone</dt>
            <dd className="text-ink">{profile.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate">Iqama</dt>
            <dd className="text-ink">
              {profile.iqama_number || "—"}
              {profile.iqama_expiry ? ` (exp ${profile.iqama_expiry})` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate">
              Employment
            </dt>
            <dd className="text-ink">
              {profile.employment_status
                ? EMPLOYMENT_STATUS_LABELS[profile.employment_status]
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      {questions.length > 0 ? (
        <div className="space-y-4">
          <p className="label !mb-0">Screening questions</p>
          {questions.map((q) => (
            <div key={q.id}>
              <label className="label" htmlFor={`q-${q.id}`}>
                {q.prompt}
                {q.required ? " *" : ""}
              </label>
              {q.input_type === "yes_no" ? (
                <select
                  id={`q-${q.id}`}
                  className="input"
                  required={q.required}
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                >
                  <option value="">Select…</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              ) : q.input_type === "textarea" ? (
                <textarea
                  id={`q-${q.id}`}
                  className="input min-h-24"
                  required={q.required}
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                />
              ) : (
                <input
                  id={`q-${q.id}`}
                  className="input"
                  required={q.required}
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                />
              )}
            </div>
          ))}
        </div>
      ) : null}

      <div>
        <label className="label" htmlFor="cover">
          Cover note
        </label>
        <textarea
          id="cover"
          className="input min-h-28"
          value={coverNote}
          onChange={(e) => setCoverNote(e.target.value)}
          placeholder="Brief note on experience and preferred location…"
        />
      </div>
      <div>
        <label className="label" htmlFor="cv">
          CV (PDF or Word, max 10 MB)
        </label>
        <input
          id="cv"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="input"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
      </div>
      {error ? <p className="text-sm text-teal">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Submitting…" : "Submit application"}
        </button>
        <Link href={`/jobs/${jobSlug}`} className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
