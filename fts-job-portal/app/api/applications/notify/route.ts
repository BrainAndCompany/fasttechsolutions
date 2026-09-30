import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { sendNewApplicationEmail } from "@/lib/email";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** After apply: email HR mailbox about the new application. */
export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const applicationId = body?.applicationId as string | undefined;
  if (!applicationId) {
    return NextResponse.json({ error: "applicationId required" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: app, error } = await supabase
    .from("applications")
    .select("id, user_id, cover_note, jobs(title)")
    .eq("id", applicationId)
    .single();

  if (error || !app || app.user_id !== profile.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const job = app.jobs as { title?: string } | null;

  try {
    await sendNewApplicationEmail({
      jobTitle: job?.title || "Open role",
      candidateName: profile.full_name || "",
      candidateEmail: profile.email,
      candidatePhone: profile.phone,
      coverNote: app.cover_note,
    });
  } catch (err) {
    console.error("[applications/notify] email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
