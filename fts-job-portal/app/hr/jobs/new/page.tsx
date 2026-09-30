import { redirect } from "next/navigation";
import { JobForm } from "@/components/JobForm";
import { BackLink, PageHeader } from "@/components/PageHeader";
import { getCurrentProfile, isHrRole } from "@/lib/auth";

export default async function NewJobPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/hr/jobs/new");
  if (!isHrRole(profile.role)) redirect("/dashboard");

  return (
    <div className="page-shell max-w-3xl">
      <BackLink href="/hr/jobs">Jobs</BackLink>
      <div className="mt-4">
        <PageHeader
          eyebrow="HR portal"
          title="New job"
          lead="Add the JD sections and optional screening questions."
        />
      </div>
      <div className="panel mt-8 px-5 py-6 sm:px-7">
        <JobForm />
      </div>
    </div>
  );
}
