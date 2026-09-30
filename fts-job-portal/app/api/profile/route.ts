import { NextResponse } from "next/server";
import { getCurrentProfile, isHrRole } from "@/lib/auth";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  EducationEntry,
  EmploymentStatus,
  ExperienceEntry,
  ProjectEntry,
} from "@/lib/types";

const EMPLOYMENT_STATUSES: EmploymentStatus[] = [
  "employed",
  "unemployed",
  "notice_period",
  "student",
  "other",
];

function asStringArrayField(
  value: unknown,
  map: (row: Record<string, unknown>) => Record<string, unknown> | null,
): unknown[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      return map(item as Record<string, unknown>);
    })
    .filter(Boolean);
}

export async function PATCH(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isHrRole(profile.role)) {
    return NextResponse.json(
      { error: "HR accounts use the HR console, not candidate profile." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    profile_updated_at: new Date().toISOString(),
  };

  if (body.full_name !== undefined) {
    patch.full_name = String(body.full_name || "").trim() || null;
  }
  if (body.phone !== undefined) {
    const raw = String(body.phone || "").trim();
    if (!raw) {
      patch.phone = null;
    } else {
      const phone = normalizePhone(raw);
      if (!isValidPhone(phone)) {
        return NextResponse.json(
          { error: "Enter a valid phone number (8–15 digits)." },
          { status: 400 },
        );
      }
      patch.phone = phone;
    }
  }
  if (body.iqama_number !== undefined) {
    patch.iqama_number = String(body.iqama_number || "").trim() || null;
  }
  if (body.iqama_expiry !== undefined) {
    patch.iqama_expiry = body.iqama_expiry
      ? String(body.iqama_expiry).slice(0, 10)
      : null;
  }
  if (body.passport_number !== undefined) {
    patch.passport_number = String(body.passport_number || "").trim() || null;
  }
  if (body.passport_expiry !== undefined) {
    patch.passport_expiry = body.passport_expiry
      ? String(body.passport_expiry).slice(0, 10)
      : null;
  }
  if (body.employment_status !== undefined) {
    const status = body.employment_status
      ? String(body.employment_status)
      : null;
    if (status && !EMPLOYMENT_STATUSES.includes(status as EmploymentStatus)) {
      return NextResponse.json(
        { error: "Invalid employment status" },
        { status: 400 },
      );
    }
    patch.employment_status = status;
  }
  if (body.current_employer !== undefined) {
    patch.current_employer = String(body.current_employer || "").trim() || null;
  }
  if (body.current_job_title !== undefined) {
    patch.current_job_title =
      String(body.current_job_title || "").trim() || null;
  }
  if (body.years_experience !== undefined) {
    const n =
      body.years_experience === "" || body.years_experience == null
        ? null
        : Number(body.years_experience);
    patch.years_experience =
      n == null || Number.isNaN(n) ? null : Math.max(0, Math.min(60, n));
  }
  if (body.education !== undefined) {
    patch.education = asStringArrayField(body.education, (row) => {
      const degree = String(row.degree || "").trim();
      const institution = String(row.institution || "").trim();
      if (!degree && !institution) return null;
      return {
        degree,
        institution,
        year: String(row.year || "").trim() || undefined,
        field: String(row.field || "").trim() || undefined,
      } satisfies EducationEntry;
    });
  }
  if (body.experience !== undefined) {
    patch.experience = asStringArrayField(body.experience, (row) => {
      const company = String(row.company || "").trim();
      const title = String(row.title || "").trim();
      if (!company && !title) return null;
      return {
        company,
        title,
        start_date: String(row.start_date || "").trim() || undefined,
        end_date: String(row.end_date || "").trim() || undefined,
        is_current: Boolean(row.is_current),
        description: String(row.description || "").trim() || undefined,
      } satisfies ExperienceEntry;
    });
  }
  if (body.projects !== undefined) {
    patch.projects = asStringArrayField(body.projects, (row) => {
      const name = String(row.name || "").trim();
      if (!name) return null;
      return {
        name,
        description: String(row.description || "").trim() || undefined,
        url: String(row.url || "").trim() || undefined,
      } satisfies ProjectEntry;
    });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", profile.id)
    .select("*")
    .single();

  if (error) {
    if (/phone|unique|duplicate/i.test(error.message)) {
      return NextResponse.json(
        {
          error: "This phone number is already registered to another account.",
          code: "phone_taken",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ profile: data });
}
