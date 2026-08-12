/** Restrained line icons — mockup-style geometric, no fake metrics. */

type IconProps = { className?: string; title?: string };

export function IconWebDev({ className, title = "Web development" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <rect x="6" y="10" width="36" height="26" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M6 18h36" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="14" r="1.5" fill="currentColor" />
      <circle cx="17" cy="14" r="1.5" fill="currentColor" />
      <path d="M16 28l4 4 8-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSeo({ className, title = "SEO" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <circle cx="22" cy="22" r="11" stroke="currentColor" strokeWidth="2" />
      <path d="M30 30l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 22h8M22 18v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconWorkflows({ className, title = "UX UI and workflows" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <circle cx="14" cy="16" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="34" cy="16" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="34" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M18.5 19.5l3 9M29.5 19.5l-3 9M19 16h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
