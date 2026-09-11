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

      {/* Anillo exterior del sello */}
      <circle cx="24" cy="24" r="23" fill="none" stroke={`url(#${id})`} strokeWidth="1.4" />
      {/* Anillo interior, más fino — da el efecto de sello/moneda */}
      <circle cx="24" cy="24" r="19.5" fill="none" stroke={`url(#${id})`} strokeWidth="0.6" strokeOpacity="0.55" />

      {/* Balanza de la justicia, minimalista: fulcro, brazo y dos platillos */}
      <circle cx="24" cy="8.6" r="1.1" fill={`url(#${id})`} />
      <line x1="24" y1="8.6" x2="24" y2="11.4" stroke={`url(#${id})`} strokeWidth="0.9" />
      <line x1="15.5" y1="11.4" x2="32.5" y2="11.4" stroke={`url(#${id})`} strokeWidth="0.9" strokeLinecap="round" />
      <line x1="15.5" y1="11.4" x2="15.5" y2="14.6" stroke={`url(#${id})`} strokeWidth="0.7" strokeOpacity="0.85" />
      <line x1="32.5" y1="11.4" x2="32.5" y2="14.6" stroke={`url(#${id})`} strokeWidth="0.7" strokeOpacity="0.85" />
      <path d="M 13.3 14.6 A 2.2 2.2 0 0 0 17.7 14.6" fill="none" stroke={`url(#${id})`} strokeWidth="0.8" strokeLinecap="round" />
      <path d="M 30.3 14.6 A 2.2 2.2 0 0 0 34.7 14.6" fill="none" stroke={`url(#${id})`} strokeWidth="0.8" strokeLinecap="round" />

      <text
        x="24"
        y="29.5"
        textAnchor="middle"
        fontFamily="var(--font-display), serif"
        fontSize="14"
        fontWeight="700"
        letterSpacing="0.6"
        fill={`url(#${id})`}
      >
        ECG
      </text>

      {/* Línea base — evoca el pedestal de la balanza */}
      <line
        x1="13.5"
        y1="34.5"
        x2="34.5"
        y2="34.5"
        stroke={`url(#${id})`}
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
    </svg>
  );
}
