import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { ProfileForm } from "@/components/ProfileForm";
import { getCurrentProfile, isHrRole } from "@/lib/auth";
import type { Profile } from "@/lib/types";
import { normalizeJsonArray } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/profile");
  if (isHrRole(profile.role)) redirect("/hr");

  const initial: Profile = {
    ...profile,
    iqama_number: profile.iqama_number ?? null,
    iqama_expiry: profile.iqama_expiry ?? null,
    passport_number: profile.passport_number ?? null,
    passport_expiry: profile.passport_expiry ?? null,
    employment_status: profile.employment_status ?? null,
    current_employer: profile.current_employer ?? null,
    current_job_title: profile.current_job_title ?? null,
    years_experience: profile.years_experience ?? null,
    education: normalizeJsonArray(profile.education),
    experience: normalizeJsonArray(profile.experience),
    projects: normalizeJsonArray(profile.projects),
    profile_updated_at: profile.profile_updated_at ?? null,
  };

  return (
    <div className="page-shell max-w-3xl">
      <PageHeader
        eyebrow="Candidate"
        title="My profile"
        lead="Keep this up to date — HR sees it when you apply."
        actions={
          <Link href="/dashboard" className="btn-secondary">
            My applications
          </Link>
        }
      />
      <div className="panel mt-8 px-5 py-6 sm:px-7 sm:py-8">
        <Suspense>
          <ProfileForm initial={initial} />
        </Suspense>
      </div>
    </div>
  );
}
