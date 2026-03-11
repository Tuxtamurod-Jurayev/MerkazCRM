const iconPaths = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.8" />
      <rect x="14" y="3" width="7" height="11" rx="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.8" />
      <rect x="14" y="17" width="7" height="4" rx="1.8" />
    </>
  ),
  subjects: (
    <>
      <path d="M4 5.5h12a2 2 0 0 1 2 2V20a1 1 0 0 1-1.6.8L12 17.5l-4.4 3.3A1 1 0 0 1 6 20V7.5a2 2 0 0 1 2-2Z" />
      <path d="M9 9h6M9 12h6" />
    </>
  ),
  teachers: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20a7 7 0 0 1 14 0" />
      <path d="M19 9l2 2 2-2" />
    </>
  ),
  students: (
    <>
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3 20a6 6 0 0 1 12 0M14.5 20a4.5 4.5 0 0 1 7.5-3.2" />
    </>
  ),
  groups: (
    <>
      <rect x="3" y="5" width="8" height="6" rx="1.5" />
      <rect x="13" y="5" width="8" height="6" rx="1.5" />
      <rect x="8" y="14" width="8" height="6" rx="1.5" />
    </>
  ),
  enrollment: (
    <>
      <path d="M4 12h10" />
      <path d="m10 8 4 4-4 4" />
      <rect x="15" y="6" width="6" height="12" rx="2" />
    </>
  ),
  payments: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 14h4M16 14h2" />
    </>
  ),
  expenses: (
    <>
      <path d="M5 4h14l-1.2 4H6.2L5 4Z" />
      <path d="M7 8h10l1 12H6L7 8Z" />
      <path d="M10 12h4" />
    </>
  ),
  debtors: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6" />
      <circle cx="12" cy="16.8" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  reports: (
    <>
      <path d="M4 20V8" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20v-11" />
    </>
  ),
  moon: (
    <>
      <path d="M15.6 3.5A8.7 8.7 0 1 0 20.5 16a7 7 0 1 1-4.9-12.5Z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
    </>
  ),
  admin: (
    <>
      <path d="M12 3 4 7v5c0 5 3.5 8.2 8 9.5 4.5-1.3 8-4.5 8-9.5V7l-8-4Z" />
      <path d="M9.5 12 11 13.5l3.5-3.5" />
    </>
  ),
  reception: (
    <>
      <path d="M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
      <path d="M7 8V6a5 5 0 1 1 10 0v2" />
    </>
  ),
  logout: (
    <>
      <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
      <path d="M14 12H21" />
      <path d="m18 9 3 3-3 3" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </>
  ),
};

export function Icon({ name, size = 18, className = "" }) {
  const path = iconPaths[name] || iconPaths.dashboard;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
