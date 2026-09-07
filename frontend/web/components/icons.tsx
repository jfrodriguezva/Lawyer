type IconProps = { className?: string };

export function IconPanel({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="2.5" width="6" height="6" stroke="currentColor" strokeWidth="1.3" />
      <rect x="11.5" y="2.5" width="6" height="10" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2.5" y="11.5" width="6" height="6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function IconFolder({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.5 5.5c0-.55.45-1 1-1h4l1.5 1.8h7.5c.55 0 1 .45 1 1v7.2c0 .55-.45 1-1 1h-13c-.55 0-1-.45-1-1v-9z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCalendar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="4" width="15" height="13" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 8h15" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 2.5v3M14 2.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function IconLogout({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 2.5H4.5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1H8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path d="M12.5 6.5 17 10l-4.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 10H7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function IconUpload({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M10 13V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M6 6.5 10 2.5 14 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 13v3a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function IconUser({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.5 17c.6-3.4 3.4-5.5 6.5-5.5s5.9 2.1 6.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function IconChat({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 4.5h14v9h-8.5L5 16v-2.5H3z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconShield({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 2.5 16.5 5v5c0 4-2.7 6.6-6.5 7.5C6.2 16.6 3.5 14 3.5 10V5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPin({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 17.5S16 12 16 7.8A6 6 0 1 0 4 7.8C4 12 10 17.5 10 17.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="7.7" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function IconPhone({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.5 3.5h2.7l1.1 3.3-1.7 1.4a9 9 0 0 0 4.2 4.2l1.4-1.7 3.3 1.1v2.7c0 .9-.8 1.6-1.7 1.4-6-1.2-9.9-5-11-11-.2-.9.5-1.4 1.4-1.4z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconMail({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="4.5" width="15" height="11" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 5.5 10 11l7.5-5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconWhatsapp({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 16.5 5 13a6.5 6.5 0 1 1 2.6 2.4L4 16.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M7.6 7.6c-.2.9.5 2.1 1.2 2.8.7.7 1.9 1.4 2.8 1.2.4-.1.7-.6.6-1l-.2-.6a.6.6 0 0 0-.6-.4l-.9.1c-.3-.3-.9-.9-1.2-1.2l.1-.9a.6.6 0 0 0-.4-.6l-.6-.2c-.4-.1-.9.2-.8.6z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10.5 8 14.5 16 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconFile({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 2.5h7l3.5 3.5v11.5h-10.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M12 2.5V6h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
