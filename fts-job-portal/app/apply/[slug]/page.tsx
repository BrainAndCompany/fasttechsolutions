import { notFound, redirect } from "next/navigation";
import { getCurrentProfile, isHrRole } from "@/lib/auth";
import { ApplyForm } from "@/components/ApplyForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Job, JobQuestion } from "@/lib/types";
import { isProfileReadyToApply } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ApplyPage({ params }: Props) {
  const { slug } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=/apply/${slug}`);
  if (isHrRole(profile.role)) redirect("/hr");

  if (!isProfileReadyToApply(profile)) {
    redirect(
      `/profile?incomplete=1&next=${encodeURIComponent(`/apply/${slug}`)}`,
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("jobs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) notFound();
  const job = data as Job;

  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", job.id)
    .eq("user_id", profile.id)
    .maybeSingle();

  const { data: questions } = await supabase
    .from("job_questions")
    .select("*")
    .eq("job_id", job.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="page-shell max-w-xl">
      <p className="section-label">Apply</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink">
        Submit your application
      </h1>
      {existing ? (
        <p className="panel mt-6 px-5 py-4 text-sm text-slate">
          You already applied for this role.{" "}
          <a href="/dashboard" className="font-semibold text-teal">
            View status
          </a>
        </p>
      ) : (
        <div className="panel mt-8 px-5 py-6 sm:px-7">
          <ApplyForm
            jobId={job.id}
            jobSlug={job.slug}
            jobTitle={job.title}
            profile={profile}
            questions={(questions ?? []) as JobQuestion[]}
          />
        </div>
      )}
    </div>
  );
}
