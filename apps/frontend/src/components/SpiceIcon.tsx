// Modern flame/fire logo icon
export const SpiceIcon = ({ className = "w-5 h-5" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
      </defs>

      {/* Main flame shape */}
      <path
        d="M12 2C12 2 8 6 8 10c0 2.21 1.79 4 4 4s4-1.79 4-4c0-4-4-8-4-8z"
        fill="url(#flameGradient)"
        opacity="0.9"
      />

      {/* Secondary flame */}
      <path
        d="M12 6c0 0-2 2-2 4c0 1.1.9 2 2 2s2-.9 2-2c0-2-2-4-2-4z"
        fill="#fed7aa"
        opacity="0.8"
      />

      {/* Outer glow */}
      <path
        d="M12 1C12 1 7 6 7 11c0 2.76 2.24 5 5 5s5-2.24 5-5c0-5-5-10-5-10z"
        stroke="#ea580c"
        strokeWidth="0.5"
        fill="none"
        opacity="0.5"
      />

      {/* Bottom heat waves */}
      <path
        d="M8 16c.5.5 1.5 1 2.5 1.5M12 17c.5.3 1 .7 1.5 1M15.5 16c-.5.5-1 .8-1.5 1.2"
        stroke="#f97316"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
};
