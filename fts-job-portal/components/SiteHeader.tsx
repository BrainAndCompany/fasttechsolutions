import Link from "next/link";
import { getCurrentProfile, isHrRole } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";

const navLink =
  "rounded-sm px-2.5 py-1.5 text-slate transition-colors hover:bg-mist hover:text-teal";

export async function SiteHeader() {
  const profile = await getCurrentProfile();
  const hr = profile ? isHrRole(profile.role) : false;
  const homeHref = hr ? "/hr" : "/";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-3.5">
        <Link
          href={homeHref}
          className="flex min-w-0 items-center gap-3"
          aria-label="Fast Tech Solutions Job Portal — home"
        >
          <Logo priority className="h-8 w-auto shrink-0 sm:h-9" />
          <span className="hidden h-7 w-px bg-line sm:block" aria-hidden />
          <span className="hidden min-w-0 sm:block">
            <span className="block font-display text-sm font-semibold tracking-tight text-ink">
              {hr ? "HR Portal" : "Careers"}
            </span>
            <span className="block text-[0.65rem] font-medium uppercase tracking-[0.12em] text-slate">
              Fast Tech Solutions
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-0.5 text-sm font-medium sm:gap-1">
          {hr && profile ? (
            <>
              <Link href="/hr" className={navLink}>
                Overview
              </Link>
              <Link href="/hr/jobs" className={navLink}>
                Jobs
              </Link>
              <Link href="/hr/applications" className={navLink}>
                Applications
              </Link>
              <Link href="/" className={navLink}>
                Public site
              </Link>
              <div className="ml-1 hidden h-5 w-px bg-line sm:block" aria-hidden />
              <SignOutButton />
            </>
          ) : profile ? (
            <>
              <Link href="/" className={navLink}>
                Positions
              </Link>
              <Link href="/profile" className={navLink}>
                Profile
              </Link>
              <Link href="/dashboard" className={navLink}>
                Applications
              </Link>
              <div className="ml-1 hidden h-5 w-px bg-line sm:block" aria-hidden />
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/" className={navLink}>
                Positions
              </Link>
              <Link href="/login" className={navLink}>
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary ml-1 !py-1.5 !text-xs">
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
