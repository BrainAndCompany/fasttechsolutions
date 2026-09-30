import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/PageHeader";
import { getCurrentProfile, isHrRole } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/types";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function JdBlock({ title, body }: { title: string; body?: string | null }) {
  if (!body?.trim()) return null;
  return (
    <div className="mt-10">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-3 h-px w-8 bg-teal" />
      <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate">
        {body}
      </div>
    </div>
  );
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const profile = await getCurrentProfile();
  const hr = profile ? isHrRole(profile.role) : false;

  const { data } = await supabase
    .from("jobs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) notFound();
  const job = data as Job;

  return (
    <div className="bg-white">
      <div className="border-b border-line bg-mist">
        <div className="page-shell !py-8">
          <BackLink href="/">All positions</BackLink>
          <p className="section-label mt-6">Open role</p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {job.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {job.department ? (
              <span className="meta-chip">{job.department}</span>
            ) : null}
            {job.location ? (
              <span className="meta-chip">{job.location}</span>
            ) : null}
            <span className="meta-chip">
              {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
            </span>
          </div>
        </div>
      </div>

      <div className="page-shell max-w-3xl !pt-10">
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate">
          {job.description}
        </div>
        <JdBlock title="Responsibilities" body={job.responsibilities} />
        <JdBlock title="Requirements" body={job.requirements} />
        <JdBlock title="Benefits" body={job.benefits} />

        <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
          {hr ? (
            <Link href="/hr/jobs" className="btn-primary">
              Manage jobs
            </Link>
          ) : profile ? (
            <Link href={`/apply/${job.slug}`} className="btn-primary">
              Apply for this role
            </Link>
          ) : (
            <>
              <Link
                href={`/login?next=${encodeURIComponent(`/apply/${job.slug}`)}`}
                className="btn-primary"
              >
                Sign in to apply
              </Link>
              <Link
                href={`/signup?next=${encodeURIComponent(`/apply/${job.slug}`)}`}
                className="btn-secondary"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
