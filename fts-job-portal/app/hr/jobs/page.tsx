import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getCurrentProfile, isHrRole } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HrJobsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/hr/jobs");
  if (!isHrRole(profile.role)) redirect("/dashboard");

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("jobs")
    .select("*")
    .order("updated_at", { ascending: false });
  const jobs = (data ?? []) as Job[];

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="HR portal"
        title="Jobs"
        lead="Create, publish, and manage role listings."
        actions={
          <Link href="/hr/jobs/new" className="btn-primary">
            New job
          </Link>
        }
      />

      <ul className="mt-8 overflow-hidden border border-line bg-white">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 last:border-b-0"
          >
            <div>
              <p className="font-display font-semibold text-ink">{job.title}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="meta-chip capitalize">{job.status}</span>
                <span className="meta-chip">/{job.slug}</span>
              </div>
            </div>
            <Link
              href={`/hr/jobs/${job.id}`}
              className="text-sm font-semibold text-teal"
            >
              Edit →
            </Link>
          </li>
        ))}
        {jobs.length === 0 ? (
          <li className="px-5 py-12 text-center text-sm text-slate">
            No jobs yet.{" "}
            <Link href="/hr/jobs/new" className="font-semibold text-teal">
              Create the first opening
            </Link>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
