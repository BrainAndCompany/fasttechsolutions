import { NextResponse } from "next/server";
import { requireHr } from "@/lib/auth";
import { syncJobQuestions } from "@/lib/job-questions";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    await requireHr();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};

  if (body.title != null) patch.title = String(body.title).trim();
  if (body.slug != null) patch.slug = slugify(String(body.slug));
  if (body.department !== undefined) patch.department = body.department || null;
  if (body.location !== undefined) patch.location = body.location || null;
  if (body.employment_type) patch.employment_type = body.employment_type;
  if (body.description != null) patch.description = String(body.description);
  if (body.responsibilities != null) {
    patch.responsibilities = String(body.responsibilities);
  }
  if (body.requirements != null) patch.requirements = String(body.requirements);
  if (body.benefits != null) patch.benefits = String(body.benefits);
  if (body.status) {
    patch.status = body.status;
    if (body.status === "published") {
      patch.published_at = new Date().toISOString();
    }
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("jobs")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (body.questions !== undefined) {
    try {
      await syncJobQuestions(supabase, id, body.questions);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Questions save failed" },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ job: data });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    await requireHr();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
