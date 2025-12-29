// Decorative spice icon
export const SpiceIcon = ({ className = "w-5 h-5" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V21c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-6.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5z"
        fill="#16a34a"
        stroke="#078C03"
        strokeWidth="0.5"
      />
      <circle cx="12" cy="9" r="1.5" fill="#FCDD09" />
    </svg>
  );
};

