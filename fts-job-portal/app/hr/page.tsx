import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getCurrentProfile, isHrRole } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HrHomePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/hr");
  if (!isHrRole(profile.role)) redirect("/dashboard");

  const supabase = await createServerSupabaseClient();
  const [{ count: jobCount }, { count: appCount }, { count: openCount }] =
    await Promise.all([
      supabase.from("jobs").select("*", { count: "exact", head: true }),
      supabase.from("applications").select("*", { count: "exact", head: true }),
      supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
    ]);

  const actions = [
    {
      href: "/hr/jobs",
      title: "Manage jobs",
      body: "Edit drafts, publish roles, and close listings.",
    },
    {
      href: "/hr/jobs/new",
      title: "Create a job",
      body: "Add JD sections and optional screening questions.",
    },
    {
      href: "/hr/applications",
      title: "Applications inbox",
      body: "Review profiles, answers, CVs, and update status.",
    },
  ];

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="HR portal"
        title="Overview"
        lead={`Signed in as ${profile.full_name || profile.email}. Publish roles, review candidates, and keep hiring moving.`}
        actions={
          <Link href="/hr/jobs/new" className="btn-primary">
            New job
          </Link>
        }
      />

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total jobs", value: jobCount ?? 0 },
          { label: "Published", value: openCount ?? 0 },
          { label: "Applications", value: appCount ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="panel px-5 py-6">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate">
              {stat.label}
            </dt>
            <dd className="stat-figure mt-3">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {actions.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="panel group block px-5 py-6 transition-colors hover:border-teal"
          >
            <div className="h-px w-8 bg-teal transition-all group-hover:w-12" />
            <h2 className="mt-4 font-display text-base font-semibold text-ink group-hover:text-teal">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate">{item.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
