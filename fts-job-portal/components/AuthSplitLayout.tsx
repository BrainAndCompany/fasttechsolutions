import Link from "next/link";
import { Logo } from "@/components/Logo";
import { BRAND } from "@/lib/branding";

const HIGHLIGHTS = [
  {
    title: "Open roles",
    body: "Browse published positions across Fast Tech Solutions teams.",
  },
  {
    title: "Apply online",
    body: "Complete your profile, upload your CV, and answer screening questions.",
  },
  {
    title: "Track progress",
    body: "Follow every application status from submitted to offer.",
  },
] as const;

const COPY = {
  login: {
    title: "Welcome back to the careers portal",
    lead: "Official hiring portal for Fast Tech Solutions — apply for open roles, manage your profile, and stay updated as HR reviews your application.",
  },
  signup: {
    title: "Start your application journey",
    lead: "Official hiring portal for Fast Tech Solutions — apply for open roles, manage your profile, and stay updated as HR reviews your application.",
  },
  forgot: {
    title: "Reset your portal password",
    lead: "Enter the email you registered with. We only send a reset link if that account already exists on the job portal.",
  },
  reset: {
    title: "Choose a new password",
    lead: "Set a strong password for your Fast Tech Solutions careers account, then sign in again.",
  },
} as const;

export function AuthSplitLayout({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: keyof typeof COPY;
}) {
  const copy = COPY[mode];
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="hero-surface relative flex min-h-[280px] flex-col justify-between overflow-hidden px-6 py-10 text-white sm:px-10 sm:py-12 lg:min-h-0 lg:w-[46%] lg:max-w-xl lg:px-12 lg:py-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 22%, #fff 1px, transparent 1.2px), radial-gradient(circle at 78% 68%, #fff 1px, transparent 1.2px)",
            backgroundSize: "26px 26px",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-20 top-0 h-full w-2/3 bg-gradient-to-l from-black/10 to-transparent"
          aria-hidden
        />

        <div className="relative">
          <Link href="/" className="inline-block">
            <Logo reversed priority className="h-11 w-auto sm:h-12" />
          </Link>
          <p className="mt-8 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/70">
            {BRAND.shortName} Careers
          </p>
          <h1 className="mt-3 max-w-md font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
            {copy.lead}
          </p>
        </div>

        <ul className="relative mt-10 hidden space-y-5 lg:block">
          {HIGHLIGHTS.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-sm bg-white"
                aria-hidden
              />
              <div>
                <p className="font-display text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/70">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="relative mt-10 text-xs text-white/55">
          {BRAND.domain} · {BRAND.email}
        </p>
      </aside>

      <section className="flex flex-1 items-center justify-center bg-mist px-4 py-10 sm:px-8 sm:py-14">
        <div className="w-full max-w-md border border-line bg-white px-6 py-8 sm:px-8 sm:py-10">
          {children}
        </div>
      </section>
    </div>
  );
}
