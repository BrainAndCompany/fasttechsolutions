import { NextResponse } from "next/server";
import { requireHr } from "@/lib/auth";
import { sendApplicationStatusEmail } from "@/lib/email";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/lib/types";
import { APPLICATION_STATUSES } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  let hr;
  try {
    hr = await requireHr();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const status = body.status as ApplicationStatus | undefined;
  const hrNotes =
    body.hr_notes !== undefined ? String(body.hr_notes) : undefined;

  if (status && !APPLICATION_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: current, error: loadError } = await supabase
    .from("applications")
    .select("*, jobs(title)")
    .eq("id", id)
    .single();

  if (loadError || !current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: candidateProfile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", current.user_id)
    .maybeSingle();

  const patch: Record<string, unknown> = {};
  if (status) patch.status = status;
  if (hrNotes !== undefined) patch.hr_notes = hrNotes;

  const { data, error } = await supabase
    .from("applications")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (status && status !== current.status) {
    await supabase.from("application_events").insert({
      application_id: id,
      from_status: current.status,
      to_status: status,
      changed_by: hr.id,
      note: body.note || null,
    });

    const job = current.jobs as { title?: string } | null;
    if (candidateProfile?.email && job?.title) {
      try {
        await sendApplicationStatusEmail({
          to: candidateProfile.email,
          candidateName: candidateProfile.full_name || "",
          jobTitle: job.title,
          status,
        });
      } catch (err) {
        // Status is already saved — never fail the PATCH because mail failed.
        console.error("[hr/applications] status email failed:", err);
      }
    }
  }

  return NextResponse.json({ application: data });
}
