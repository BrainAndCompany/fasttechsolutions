/** Sync job_questions rows for a job (replace-all). */
export async function syncJobQuestions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  jobId: string,
  questions: unknown,
) {
  if (!Array.isArray(questions)) return;

  await supabase.from("job_questions").delete().eq("job_id", jobId);

  const rows = questions
    .map((q, index) => {
      if (!q || typeof q !== "object") return null;
      const row = q as Record<string, unknown>;
      const prompt = String(row.prompt || "").trim();
      if (!prompt) return null;
      const inputType = String(row.input_type || "text");
      const allowed = ["text", "textarea", "yes_no"];
      return {
        job_id: jobId,
        prompt,
        input_type: allowed.includes(inputType) ? inputType : "text",
        required: row.required !== false,
        sort_order:
          typeof row.sort_order === "number" ? row.sort_order : index,
      };
    })
    .filter(Boolean);

  if (rows.length) {
    const { error } = await supabase.from("job_questions").insert(rows);
    if (error) throw new Error(error.message);
  }
}
