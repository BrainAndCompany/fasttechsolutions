"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type {
  EmploymentType,
  JobStatus,
  QuestionInputType,
} from "@/lib/types";

type DraftQuestion = {
  key: string;
  prompt: string;
  input_type: QuestionInputType;
  required: boolean;
};

export function JobForm({
  initial,
  jobId,
  initialQuestions = [],
}: {
  initial?: {
    title: string;
    slug: string;
    department: string;
    location: string;
    employment_type: EmploymentType;
    description: string;
    responsibilities: string;
    requirements: string;
    benefits: string;
    status: JobStatus;
  };
  jobId?: string;
  initialQuestions?: {
    prompt: string;
    input_type: QuestionInputType;
    required: boolean;
  }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [department, setDepartment] = useState(initial?.department ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    initial?.employment_type ?? "full_time",
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [responsibilities, setResponsibilities] = useState(
    initial?.responsibilities ?? "",
  );
  const [requirements, setRequirements] = useState(initial?.requirements ?? "");
  const [benefits, setBenefits] = useState(initial?.benefits ?? "");
  const [status, setStatus] = useState<JobStatus>(initial?.status ?? "draft");
  const [questions, setQuestions] = useState<DraftQuestion[]>(
    initialQuestions.map((q, i) => ({
      key: `q-${i}-${q.prompt.slice(0, 12)}`,
      prompt: q.prompt,
      input_type: q.input_type,
      required: q.required,
    })),
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      title,
      slug,
      department,
      location,
      employment_type: employmentType,
      description,
      responsibilities,
      requirements,
      benefits,
      status,
      questions: questions.map((q, index) => ({
        prompt: q.prompt,
        input_type: q.input_type,
        required: q.required,
        sort_order: index,
      })),
    };

    const res = await fetch(
      jobId ? `/api/hr/jobs/${jobId}` : "/api/hr/jobs",
      {
        method: jobId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(body.error || "Save failed");
      return;
    }
    router.push("/hr/jobs");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Title</label>
        <input
          className="input"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Slug (URL)</label>
        <input
          className="input"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="auto from title if empty"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Department</label>
          <input
            className="input"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Location</label>
          <input
            className="input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Employment type</label>
          <select
            className="input"
            value={employmentType}
            onChange={(e) =>
              setEmploymentType(e.target.value as EmploymentType)
            }
          >
            <option value="full_time">Full time</option>
            <option value="part_time">Part time</option>
            <option value="contract">Contract</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as JobStatus)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Overview</label>
        <textarea
          className="input min-h-32"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Responsibilities</label>
        <textarea
          className="input min-h-28"
          value={responsibilities}
          onChange={(e) => setResponsibilities(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Requirements</label>
        <textarea
          className="input min-h-28"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Benefits</label>
        <textarea
          className="input min-h-24"
          value={benefits}
          onChange={(e) => setBenefits(e.target.value)}
        />
      </div>

      <div className="space-y-3 border-t border-line pt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="label !mb-0">Screening questions</p>
            <p className="mt-1 text-xs text-slate">
              Optional. If you add any required questions, candidates must
              answer them when applying.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary !py-1.5 !text-xs"
            onClick={() =>
              setQuestions((rows) => [
                ...rows,
                {
                  key: `q-${Date.now()}`,
                  prompt: "",
                  input_type: "text",
                  required: true,
                },
              ])
            }
          >
            Add question
          </button>
        </div>
        {questions.map((q, index) => (
          <div key={q.key} className="space-y-3 border border-line p-4">
            <input
              className="input"
              required
              placeholder="Question text"
              value={q.prompt}
              onChange={(e) =>
                setQuestions((rows) =>
                  rows.map((row, i) =>
                    i === index ? { ...row, prompt: e.target.value } : row,
                  ),
                )
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="input"
                value={q.input_type}
                onChange={(e) =>
                  setQuestions((rows) =>
                    rows.map((row, i) =>
                      i === index
                        ? {
                            ...row,
                            input_type: e.target.value as QuestionInputType,
                          }
                        : row,
                    ),
                  )
                }
              >
                <option value="text">Short text</option>
                <option value="textarea">Long text</option>
                <option value="yes_no">Yes / No</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-slate">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) =>
                    setQuestions((rows) =>
                      rows.map((row, i) =>
                        i === index
                          ? { ...row, required: e.target.checked }
                          : row,
                      ),
                    )
                  }
                />
                Required
              </label>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-teal"
              onClick={() =>
                setQuestions((rows) => rows.filter((_, i) => i !== index))
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-teal">{error}</p> : null}
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : "Save job"}
        </button>
        <Link href="/hr/jobs" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
