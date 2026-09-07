export default function Monogram({ size = 48 }: { size?: number }) {
  const id = "monogram-gradient";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8cd82" />
          <stop offset="55%" stopColor="#c9a24a" />
          <stop offset="100%" stopColor="#8c6b1f" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="none" stroke={`url(#${id})`} strokeWidth="1.5" />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontFamily="var(--font-display), serif"
        fontSize="18"
        fontWeight="700"
        fill={`url(#${id})`}
      >
        EC
      </text>
    </svg>
  );
}
