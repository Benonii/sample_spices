// Small decorative Ethiopian flag icon
export const EthiopianFlagIcon = ({ className = "w-4 h-4" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 16"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Green stripe */}
      <rect y="0" width="24" height="5.33" fill="#078C03" />
      {/* Yellow stripe */}
      <rect y="5.33" width="24" height="5.33" fill="#FCDD09" />
      {/* Red stripe */}
      <rect y="10.66" width="24" height="5.34" fill="#DA1212" />
      {/* Star (simplified) */}
      <circle cx="12" cy="8" r="1.5" fill="#FCDD09" />
    </svg>
  );
};

