import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function SignOutButton() {
  async function signOut() {
    "use server";
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return (
    <form action={signOut}>
      <button type="submit" className="btn-ghost !py-1.5 !text-xs">
        Sign out
      </button>
    </form>
  );
}
