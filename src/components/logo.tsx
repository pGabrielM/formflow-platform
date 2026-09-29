export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <defs>
          <linearGradient id="ff-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#b53aea" />
            <stop offset="1" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="11" fill="url(#ff-g)" />
        <rect x="8" y="9" width="16" height="3.5" rx="1.75" fill="#fff" />
        <rect x="8" y="15" width="11" height="3.5" rx="1.75" fill="#fff" fillOpacity="0.85" />
        <circle cx="22" cy="22" r="3" fill="#fff" />
      </svg>
      {!compact && <span className="font-display text-xl font-extrabold tracking-tight">formflow</span>}
    </span>
  )
}
