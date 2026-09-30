#!/usr/bin/env node
/**
 * Apply job-portal schema to the dedicated Supabase project.
 * Requires DATABASE_URL (Settings → Database → URI) or run the SQL
 * manually in Supabase Dashboard → SQL Editor.
 *
 *   node scripts/apply-schema.mjs
 */
const fs = require("fs");
const path = require("path");

async function main() {
  const sqlPath = path.join(
    __dirname,
    "..",
    "supabase",
    "migrations",
    "00001_job_portal_schema.sql",
  );
  const sql = fs.readFileSync(sqlPath, "utf8");
  const dbUrl = process.env.DATABASE_URL?.trim();

  if (!dbUrl) {
    console.log(`
No DATABASE_URL set.

1. Open https://supabase.com/dashboard/project/tmcxeobmdzrmsyklzfmg/sql/new
2. Paste contents of supabase/migrations/00001_job_portal_schema.sql
3. Run

Or set DATABASE_URL (Postgres URI from Project Settings → Database) and re-run:
  DATABASE_URL=postgres://... node scripts/apply-schema.mjs
`);
    process.exit(0);
  }

  const { Client } = require("pg");
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("Schema applied successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
