import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";
import { normalizeJsonArray } from "@/lib/types";

export async function getSessionUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function mapProfile(data: Record<string, unknown>): Profile {
  return {
    id: String(data.id),
    email: String(data.email ?? ""),
    full_name: (data.full_name as string | null) ?? null,
    phone: (data.phone as string | null) ?? null,
    role: data.role as UserRole,
    iqama_number: (data.iqama_number as string | null) ?? null,
    iqama_expiry: (data.iqama_expiry as string | null) ?? null,
    passport_number: (data.passport_number as string | null) ?? null,
    passport_expiry: (data.passport_expiry as string | null) ?? null,
    employment_status:
      (data.employment_status as Profile["employment_status"]) ?? null,
    current_employer: (data.current_employer as string | null) ?? null,
    current_job_title: (data.current_job_title as string | null) ?? null,
    years_experience:
      data.years_experience == null ? null : Number(data.years_experience),
    education: normalizeJsonArray(data.education),
    experience: normalizeJsonArray(data.experience),
    projects: normalizeJsonArray(data.projects),
    profile_updated_at: (data.profile_updated_at as string | null) ?? null,
    created_at: String(data.created_at ?? ""),
    updated_at: String(data.updated_at ?? ""),
  };
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;
  return mapProfile(data as Record<string, unknown>);
}

export function isHrRole(role: UserRole | null | undefined): boolean {
  return role === "hr" || role === "admin";
}

export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("UNAUTHORIZED");
  }
  return profile;
}

export async function requireHr() {
  const profile = await requireProfile();
  if (!isHrRole(profile.role)) {
    throw new Error("FORBIDDEN");
  }
  return profile;
}
