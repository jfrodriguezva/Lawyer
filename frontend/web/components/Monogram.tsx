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

      {/* Punto de fulcro: mismo acento que la balanza de la justicia del sitio */}
      <circle cx="24" cy="10.6" r="1.25" fill={`url(#${id})`} />

      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontFamily="var(--font-display), serif"
        fontSize="17"
        fontWeight="700"
        letterSpacing="0.5"
        fill={`url(#${id})`}
      >
        EC
      </text>

      {/* Línea base — evoca el pedestal de la balanza */}
      <line
        x1="15.5"
        y1="34.5"
        x2="32.5"
        y2="34.5"
        stroke={`url(#${id})`}
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
    </svg>
  );
}
