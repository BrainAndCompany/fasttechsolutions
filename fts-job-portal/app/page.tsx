import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getCurrentProfile, isHrRole } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/types";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const profile = await getCurrentProfile();
  const hr = profile ? isHrRole(profile.role) : false;

  const { data } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const jobs = (data ?? []) as Job[];

  return (
    <div className="bg-white">
      <section className="hero-surface relative overflow-hidden text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #fff 1px, transparent 1.2px), radial-gradient(circle at 80% 70%, #fff 1px, transparent 1.2px)",
            backgroundSize: "26px 26px",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 top-0 h-full w-1/2 bg-gradient-to-l from-black/10 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <Logo
            reversed
            priority
            className="h-12 w-auto sm:h-14 animate-[fade-in_180ms_ease-out]"
          />
          {hr ? (
            <>
              <p className="mt-8 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/70 animate-[fade-up_220ms_ease-out]">
                HR workspace
              </p>
              <h1 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-5xl animate-[fade-up_260ms_ease-out]">
                Hire for Fast Tech Solutions
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base animate-[fade-up_300ms_ease-out]">
                Publish roles, review candidate profiles and CVs, and keep every
                application moving from one console.
              </p>
              <div className="mt-9 flex flex-wrap gap-3 animate-[fade-up_340ms_ease-out]">
                <Link
                  href="/hr"
                  className="btn bg-white text-teal hover:bg-mist"
                >
                  Open HR console
                </Link>
                <Link
                  href="/hr/applications"
                  className="btn border border-white/40 text-white hover:bg-white/10"
                >
                  Applications inbox
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="mt-8 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/70 animate-[fade-up_220ms_ease-out]">
                Careers
              </p>
              <h1 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-5xl animate-[fade-up_260ms_ease-out]">
                Build your career with Fast Tech Solutions
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base animate-[fade-up_300ms_ease-out]">
                Explore open roles across our teams. Apply online, complete your
                profile, and track every application in one place.
              </p>
              <div className="mt-9 flex flex-wrap gap-3 animate-[fade-up_340ms_ease-out]">
                <a
                  href="#open-positions"
                  className="btn bg-white text-teal hover:bg-mist"
                >
                  View open positions
                </a>
                {profile ? (
                  <Link
                    href="/dashboard"
                    className="btn border border-white/40 text-white hover:bg-white/10"
                  >
                    My applications
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className="btn border border-white/40 text-white hover:bg-white/10"
                  >
                    Create account
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {!hr ? (
        <section className="border-b border-line bg-mist">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
            {[
              {
                title: "Complete profile",
                body: "Iqama, experience, and education — ready before you apply.",
              },
              {
                title: "Apply online",
                body: "Upload your CV and answer any role-specific questions.",
              },
              {
                title: "Track status",
                body: "See updates as HR moves your application forward.",
              },
            ].map((item) => (
              <div key={item.title}>
                <div className="h-px w-8 bg-teal" />
                <h2 className="mt-3 font-display text-sm font-semibold text-ink">
                  {item.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section id="open-positions" className="page-shell !bg-white">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">
              {hr ? "Public listing" : "Open positions"}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              {hr ? "What candidates see" : "Roles hiring now"}
            </h2>
          </div>
          {jobs.length > 0 ? (
            <p className="meta-chip">
              {jobs.length} {jobs.length === 1 ? "role" : "roles"} open
            </p>
          ) : null}
        </div>

        {jobs.length === 0 ? (
          <div className="mt-10 border border-line bg-mist px-6 py-16 text-center">
            <p className="font-display text-lg font-semibold text-ink">
              No open positions right now
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate">
              {hr
                ? "Publish a role from the HR console to list it here."
                : "Check back soon — or create an account so you are ready when roles publish."}
            </p>
            <Link
              href={hr ? "/hr/jobs/new" : "/signup"}
              className="btn-primary mt-7 inline-flex"
            >
              {hr ? "Create a job" : "Create account"}
            </Link>
          </div>
        ) : (
          <ul className="mt-8 overflow-hidden border border-line">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link href={`/jobs/${job.slug}`} className="job-row group">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-lg font-semibold text-ink transition-colors group-hover:text-teal">
                        {job.title}
                      </h3>
                      <div className="mt-2.5 flex flex-wrap gap-2">
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
                    <span className="shrink-0 pt-1 text-sm font-semibold text-teal">
                      {hr ? "Preview →" : "View & apply →"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
