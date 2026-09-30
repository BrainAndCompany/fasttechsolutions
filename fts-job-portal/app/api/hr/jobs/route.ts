import { NextResponse } from "next/server";
import { requireHr } from "@/lib/auth";
import { syncJobQuestions } from "@/lib/job-questions";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/types";

export async function GET() {
  try {
    await requireHr();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ jobs: data ?? [] });
}

export async function POST(request: Request) {
  let profile;
  try {
    profile = await requireHr();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const title = String(body.title).trim();
  const baseSlug = slugify(body.slug || title) || `job-${Date.now()}`;
  const status = body.status === "published" ? "published" : "draft";

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      title,
      slug: baseSlug,
      department: body.department || null,
      location: body.location || null,
      employment_type: body.employment_type || "full_time",
      description: body.description || "",
      responsibilities: body.responsibilities || "",
      requirements: body.requirements || "",
      benefits: body.benefits || "",
      status,
      created_by: profile.id,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    await syncJobQuestions(supabase, data.id, body.questions);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Questions save failed" },
      { status: 400 },
    );
  }

  return NextResponse.json({ job: data });
}
