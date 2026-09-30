import nodemailer from "nodemailer";
import { getAppUrl } from "@/lib/supabase/public-env";
import type { ApplicationStatus } from "@/lib/types";
import { APPLICATION_STATUS_LABELS } from "@/lib/types";

function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASSWORD?.trim(),
  );
}

function getTransporter() {
  const host = process.env.SMTP_HOST!.trim();
  const port = Number(process.env.SMTP_PORT?.trim() || "465");
  const secure =
    process.env.SMTP_SECURE?.trim() !== "false" && port === 465;
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER!.trim(),
      pass: process.env.SMTP_PASSWORD!.trim(),
    },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 30_000,
  });
}

function fromAddress(): string {
  return (
    process.env.SMTP_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "hr@fts-ksa.com"
  );
}

function hrNotifyAddress(): string {
  return (
    process.env.HR_NOTIFY_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "hr@fts-ksa.com"
  );
}

async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
}) {
  if (!smtpConfigured()) {
    console.info("[email skipped] SMTP not configured", opts.subject);
    return { skipped: true as const };
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"FTS Careers" <${fromAddress()}>`,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
    });
    return { skipped: false as const };
  } catch (err) {
    console.error("[email] SMTP send failed:", err);
    return { skipped: true as const, error: true as const };
  }
}

/** New application → notify HR mailbox (hr@fts-ksa.com). */
export async function sendNewApplicationEmail(opts: {
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string | null;
  coverNote?: string | null;
}) {
  const portal = getAppUrl();
  return sendMail({
    to: hrNotifyAddress(),
    subject: `New application — ${opts.jobTitle}`,
    text: [
      "A new application was submitted on the FTS Job Portal.",
      "",
      `Role: ${opts.jobTitle}`,
      `Candidate: ${opts.candidateName || "—"}`,
      `Email: ${opts.candidateEmail}`,
      opts.candidatePhone ? `Phone: ${opts.candidatePhone}` : null,
      "",
      opts.coverNote ? `Cover note:\n${opts.coverNote}` : null,
      "",
      `Review in HR console: ${portal}/hr/applications`,
      "",
      "— FTS Job Portal",
    ]
      .filter((line) => line !== null)
      .join("\n"),
  });
}

export async function sendApplicationStatusEmail(opts: {
  to: string;
  candidateName: string;
  jobTitle: string;
  status: ApplicationStatus;
}) {
  const portal = getAppUrl();
  const label = APPLICATION_STATUS_LABELS[opts.status];

  return sendMail({
    to: opts.to,
    subject: `FTS Job Portal — ${opts.jobTitle}: ${label}`,
    text: [
      `Hello ${opts.candidateName || "candidate"},`,
      "",
      `Your application for “${opts.jobTitle}” is now: ${label}.`,
      "",
      `Track your applications: ${portal}/dashboard`,
      "",
      "— Fast Tech Solutions Careers",
    ].join("\n"),
  });
}
