"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApplicationStatus } from "@/lib/types";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
} from "@/lib/types";

export function ApplicationStatusForm({
  applicationId,
  status,
  hrNotes,
}: {
  applicationId: string;
  status: ApplicationStatus;
  hrNotes: string | null;
}) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState(status);
  const [notes, setNotes] = useState(hrNotes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/hr/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, hr_notes: notes }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(body.error || "Update failed");
      return;
    }
    router.refresh();
  }

  async function downloadCv() {
    const res = await fetch(`/api/hr/applications/${applicationId}/cv`);
    const body = await res.json();
    if (!res.ok || !body.url) {
      setError(body.error || "CV unavailable");
      return;
    }
    window.open(body.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mt-6 space-y-4 border-t border-line pt-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={nextStatus}
            onChange={(e) =>
              setNextStatus(e.target.value as ApplicationStatus)
            }
          >
            {APPLICATION_STATUSES.filter((s) => s !== "withdrawn").map((s) => (
              <option key={s} value={s}>
                {APPLICATION_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button type="button" className="btn-secondary" onClick={downloadCv}>
            Download CV
          </button>
        </div>
      </div>
      <div>
        <label className="label">HR notes (internal)</label>
        <textarea
          className="input min-h-24"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-teal">{error}</p> : null}
      <button
        type="button"
        className="btn-primary"
        disabled={loading}
        onClick={save}
      >
        {loading ? "Saving…" : "Update application"}
      </button>
    </div>
  );
}
