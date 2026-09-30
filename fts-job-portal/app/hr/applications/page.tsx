import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplicationStatusForm } from "@/components/ApplicationStatusForm";
import { PageHeader } from "@/components/PageHeader";
import { getCurrentProfile, isHrRole } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  Application,
  ApplicationStatus,
  Job,
  JobQuestion,
  Profile,
} from "@/lib/types";
import {
  APPLICATION_STATUS_LABELS,
  EMPLOYMENT_STATUS_LABELS,
  normalizeJsonArray,
} from "@/lib/types";

export const dynamic = "force-dynamic";

type Row = Application & {
  jobs: Pick<Job, "title" | "slug"> | null;
};

type AnswerRow = {
  application_id: string;
  question_id: string;
  answer_text: string;
};

export default async function HrApplicationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/hr/applications");
  if (!isHrRole(profile.role)) redirect("/dashboard");

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("applications")
    .select("*, jobs(title, slug)")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Row[];
  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const appIds = rows.map((r) => r.id);

  const [{ data: profiles }, { data: answers }, { data: questions }] =
    await Promise.all([
      userIds.length
        ? supabase.from("profiles").select("*").in("id", userIds)
        : Promise.resolve({ data: [] as Profile[] }),
      appIds.length
        ? supabase
            .from("application_answers")
            .select("application_id, question_id, answer_text")
            .in("application_id", appIds)
        : Promise.resolve({ data: [] as AnswerRow[] }),
      supabase.from("job_questions").select("id, prompt, job_id"),
    ]);

  const byId = new Map(
    ((profiles ?? []) as Profile[]).map((p) => [
      p.id,
      {
        ...p,
        education: normalizeJsonArray(p.education),
        experience: normalizeJsonArray(p.experience),
        projects: normalizeJsonArray(p.projects),
      },
    ]),
  );

  const questionById = new Map(
    ((questions ?? []) as Pick<JobQuestion, "id" | "prompt" | "job_id">[]).map(
      (q) => [q.id, q],
    ),
  );

  const answersByApp = new Map<string, AnswerRow[]>();
  for (const a of (answers ?? []) as AnswerRow[]) {
    const list = answersByApp.get(a.application_id) ?? [];
    list.push(a);
    answersByApp.set(a.application_id, list);
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="HR portal"
        title="Applications inbox"
        lead="Review profiles, screening answers, and CVs. Update status for the candidate dashboard."
      />

      <ul className="mt-8 space-y-5">
        {rows.map((row) => {
          const person = byId.get(row.user_id);
          const appAnswers = answersByApp.get(row.id) ?? [];
          return (
            <li key={row.id} className="panel px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-semibold text-ink">
                    {row.jobs?.title ?? "Role"}
                  </h2>
                  <p className="mt-1 text-sm text-slate">
                    {person?.full_name || "Candidate"} · {person?.email}
                    {person?.phone ? ` · ${person.phone}` : ""}
                  </p>
                  <p className="mt-2">
                    <span className="status-pill">
                      {
                        APPLICATION_STATUS_LABELS[
                          row.status as ApplicationStatus
                        ]
                      }
                    </span>
                  </p>

                  {person ? (
                    <dl className="mt-4 grid gap-2 border border-line bg-mist p-3 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="uppercase tracking-wide text-slate">
                          Iqama
                        </dt>
                        <dd className="mt-0.5 text-ink">
                          {person.iqama_number || "—"}
                          {person.iqama_expiry
                            ? ` · exp ${person.iqama_expiry}`
                            : ""}
                        </dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-wide text-slate">
                          Passport
                        </dt>
                        <dd className="mt-0.5 text-ink">
                          {person.passport_number || "—"}
                          {person.passport_expiry
                            ? ` · exp ${person.passport_expiry}`
                            : ""}
                        </dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-wide text-slate">
                          Employment
                        </dt>
                        <dd className="mt-0.5 text-ink">
                          {person.employment_status
                            ? EMPLOYMENT_STATUS_LABELS[person.employment_status]
                            : "—"}
                          {person.current_employer
                            ? ` · ${person.current_employer}`
                            : ""}
                          {person.current_job_title
                            ? ` (${person.current_job_title})`
                            : ""}
                        </dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-wide text-slate">
                          Experience
                        </dt>
                        <dd className="mt-0.5 text-ink">
                          {person.years_experience != null
                            ? `${person.years_experience} yrs`
                            : "—"}
                          {person.experience?.length
                            ? ` · ${person.experience.length} roles listed`
                            : ""}
                          {person.education?.length
                            ? ` · ${person.education.length} education`
                            : ""}
                        </dd>
                      </div>
                    </dl>
                  ) : null}

                  {appAnswers.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate">
                        Screening answers
                      </p>
                      {appAnswers.map((a) => (
                        <div key={a.question_id} className="text-sm">
                          <p className="font-medium text-ink">
                            {questionById.get(a.question_id)?.prompt ??
                              "Question"}
                          </p>
                          <p className="mt-0.5 text-slate">{a.answer_text}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {row.cover_note ? (
                    <p className="mt-3 text-sm leading-relaxed text-slate">
                      {row.cover_note}
                    </p>
                  ) : null}
                </div>
              </div>
              <ApplicationStatusForm
                applicationId={row.id}
                status={row.status}
                hrNotes={row.hr_notes}
              />
            </li>
          );
        })}
        {rows.length === 0 ? (
          <li className="panel px-5 py-12 text-center text-sm text-slate">
            No applications yet.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
