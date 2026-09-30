import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/types";

/** Public catalogue for marketing site + portal. */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, title, slug, department, location, employment_type, description, published_at, created_at",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3001";

  const jobs = ((data ?? []) as Job[]).map((job) => ({
    ...job,
    applyUrl: `${origin}/jobs/${job.slug}`,
  }));

  return NextResponse.json(
    { jobs },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
