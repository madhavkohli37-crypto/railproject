export default function RewardCoinIcon({ className = 'h-6 w-6', label = 'RailCoin' }) {
  return (
    <span className={`inline-flex items-center justify-center align-middle ${className}`} title={label} aria-label={label} role="img">
      <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden="true">
        <circle cx="16" cy="16" r="13" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
        <circle cx="16" cy="16" r="9" fill="none" stroke="#fde68a" strokeWidth="1.5" />
        <path d="M19.5 10.5h-5a3 3 0 0 0 0 6h3a3 3 0 0 1 0 6h-5M16 8v16" fill="none" stroke="#92400e" strokeLinecap="round" strokeWidth="2" />
      </svg>
    </span>
  );
}
