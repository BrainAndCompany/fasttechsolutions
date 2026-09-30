import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getCurrentProfile, isHrRole } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Application, Job } from "@/lib/types";
import { APPLICATION_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

type Row = Application & { jobs: Pick<Job, "title" | "slug"> | null };

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard");
  if (isHrRole(profile.role)) redirect("/hr");

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("applications")
    .select("*, jobs(title, slug)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Row[];

  return (
    <div className="page-shell max-w-4xl">
      <PageHeader
        eyebrow="Candidate"
        title="My applications"
        lead={`Signed in as ${profile.full_name || profile.email}`}
        actions={
          <>
            <Link href="/profile" className="btn-secondary">
              My profile
            </Link>
            <Link href="/" className="btn-primary">
              Browse jobs
            </Link>
          </>
        }
      />

      {rows.length === 0 ? (
        <div className="panel mt-8 px-6 py-14 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            No applications yet
          </p>
          <p className="mt-2 text-sm text-slate">
            Browse open roles and submit your first application.
          </p>
          <Link href="/" className="btn-primary mt-6 inline-flex">
            View open positions
          </Link>
        </div>
      ) : (
        <ul className="mt-8 overflow-hidden border border-line bg-white">
          {rows.map((row) => (
            <li
              key={row.id}
              className="border-b border-line px-5 py-4 last:border-b-0"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-semibold text-ink">
                    {row.jobs?.title ?? "Role"}
                  </h2>
                  <p className="mt-1 text-xs text-slate">
                    Applied{" "}
                    {new Date(row.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="status-pill">
                  {APPLICATION_STATUS_LABELS[row.status]}
                </span>
              </div>
              {row.jobs?.slug ? (
                <Link
                  href={`/jobs/${row.jobs.slug}`}
                  className="mt-3 inline-block text-xs font-semibold text-teal"
                >
                  View job →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
