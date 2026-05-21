type IconProps = { className?: string };

export function IconOverview({ className = "admin-nav-icon" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M3 4.5A1.5 1.5 0 014.5 3h3A1.5 1.5 0 019 4.5v3A1.5 1.5 0 017.5 9h-3A1.5 1.5 0 013 7.5v-3zM11 4.5A1.5 1.5 0 0112.5 3h3A1.5 1.5 0 0117 4.5v3A1.5 1.5 0 0115.5 9h-3A1.5 1.5 0 0111 7.5v-3zM3 12.5A1.5 1.5 0 014.5 11h3A1.5 1.5 0 019 12.5v3A1.5 1.5 0 017.5 17h-3A1.5 1.5 0 013 15.5v-3zM11 12.5A1.5 1.5 0 0112.5 11h3A1.5 1.5 0 0117 12.5v3A1.5 1.5 0 0115.5 17h-3A1.5 1.5 0 0111 15.5v-3z" />
    </svg>
  );
}

export function IconMenu({ className = "admin-nav-icon" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M4 5.5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm0 4.5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm0 4.5a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1z" />
    </svg>
  );
}

export function IconImage({ className = "admin-nav-icon" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm9.42 2.38l-2.83-2.83a1 1 0 00-1.41 0L8.5 12.09l-1.3-1.3a1 1 0 00-1.41 0L3.5 13.38V15h13v-1.62l-2.08-2z" clipRule="evenodd" />
    </svg>
  );
}

export function IconText({ className = "admin-nav-icon" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M4 4.5A1 1 0 015 4h10a1 1 0 110 2H5a1 1 0 01-1-.5zM4 9.5A1 1 0 015 9h7a1 1 0 110 2H5a1 1 0 01-1-1zM4 14.5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" />
    </svg>
  );
}

export function IconMail({ className = "admin-nav-icon" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M3.5 5A2.5 2.5 0 016 2.5h8A2.5 2.5 0 0116.5 5v10A2.5 2.5 0 0114 17.5H6A2.5 2.5 0 013.5 15V5zm1.4-.9a1 1 0 00-.9 1.6l5.11 3.41a1 1 0 001.18 0l5.11-3.41a1 1 0 00-.9-1.6H4.9z" />
    </svg>
  );
}

export function IconSupport({ className = "admin-nav-icon" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M10 2a6 6 0 00-3.89 10.68l-.55 1.65a.75.75 0 001.18.82l1.47-1.1A6 6 0 1010 2zm0 3.5a1 1 0 100 2 1 1 0 000-2zm0 3.5a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

export function IconSettings({ className = "admin-nav-icon" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M8.34 2.5a1.66 1.66 0 013.32 0l.08.47a1.66 1.66 0 002.45.96l.42-.27a1.66 1.66 0 012.32 2.32l-.27.42a1.66 1.66 0 00.96 2.45l.47.08a1.66 1.66 0 010 3.32l-.47.08a1.66 1.66 0 00-.96 2.45l.27.42a1.66 1.66 0 01-2.32 2.32l-.42-.27a1.66 1.66 0 00-2.45.96l-.08.47a1.66 1.66 0 01-3.32 0l-.08-.47a1.66 1.66 0 00-2.45-.96l-.42.27a1.66 1.66 0 01-2.32-2.32l.27-.42a1.66 1.66 0 00-.96-2.45l-.47-.08a1.66 1.66 0 010-3.32l.47-.08a1.66 1.66 0 00.96-2.45l-.27-.42a1.66 1.66 0 012.32-2.32l.42.27a1.66 1.66 0 002.45-.96l.08-.47zM10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
    </svg>
  );
}

export function IconExternal({ className }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M11 3a1 1 0 100 2h2.59l-6.3 6.29a1 1 0 001.42 1.42L15 6.41V9a1 1 0 102 0V4a1 1 0 00-1-1h-5zM5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
    </svg>
  );
}
