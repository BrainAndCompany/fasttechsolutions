import Link from "next/link";

export function PageHeader({
  eyebrow,
  title,
  lead,
  actions,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div className="min-w-0">
        {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
        <h1 className={`page-title ${eyebrow ? "mt-2" : ""}`}>{title}</h1>
        {lead ? <p className="page-lead">{lead}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-teal transition-colors hover:text-teal"
    >
      <span aria-hidden>←</span>
      {children}
    </Link>
  );
}
