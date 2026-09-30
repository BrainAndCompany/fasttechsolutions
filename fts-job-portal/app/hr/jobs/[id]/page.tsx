import { notFound, redirect } from "next/navigation";
import { JobForm } from "@/components/JobForm";
import { BackLink, PageHeader } from "@/components/PageHeader";
import { getCurrentProfile, isHrRole } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Job, JobQuestion } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditJobPage({ params }: Props) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=/hr/jobs/${id}`);
  if (!isHrRole(profile.role)) redirect("/dashboard");

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const job = data as Job;

  const { data: questions } = await supabase
    .from("job_questions")
    .select("*")
    .eq("job_id", id)
    .order("sort_order", { ascending: true });

  return (
    <div className="page-shell max-w-3xl">
      <BackLink href="/hr/jobs">Jobs</BackLink>
      <div className="mt-4">
        <PageHeader eyebrow="HR portal" title="Edit job" />
      </div>
      <div className="panel mt-8 px-5 py-6 sm:px-7">
        <JobForm
          jobId={job.id}
          initial={{
            title: job.title,
            slug: job.slug,
            department: job.department ?? "",
            location: job.location ?? "",
            employment_type: job.employment_type,
            description: job.description,
            responsibilities: job.responsibilities ?? "",
            requirements: job.requirements ?? "",
            benefits: job.benefits ?? "",
            status: job.status,
          }}
          initialQuestions={((questions ?? []) as JobQuestion[]).map((q) => ({
            prompt: q.prompt,
            input_type: q.input_type,
            required: q.required,
          }))}
        />
      </div>
    </div>
  );
}
