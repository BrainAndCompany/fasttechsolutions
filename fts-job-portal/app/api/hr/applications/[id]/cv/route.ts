import { NextResponse } from "next/server";
import { requireHr } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Ctx = { params: Promise<{ id: string }> };

/** Signed CV download for HR. */
export async function GET(_request: Request, ctx: Ctx) {
  try {
    await requireHr();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const supabase = await createServerSupabaseClient();
  const { data: app, error } = await supabase
    .from("applications")
    .select("cv_path, cv_file_name")
    .eq("id", id)
    .single();

  if (error || !app?.cv_path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: signed, error: signError } = await supabase.storage
    .from("cvs")
    .createSignedUrl(app.cv_path, 60);

  if (signError || !signed?.signedUrl) {
    return NextResponse.json(
      { error: signError?.message || "Could not sign URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    url: signed.signedUrl,
    fileName: app.cv_file_name,
  });
}
