interface Props {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

const SIZES = {
  sm: { width: 120, height: 32, text: 20, tagline: 5 },
  md: { width: 200, height: 52, text: 32, tagline: 7 },
  lg: { width: 300, height: 80, text: 50, tagline: 10 },
};

export function EnturLogo({
  className = "",
  size = "md",
  showTagline = false,
}: Props) {
  const s = SIZES[size];

  return (
    <svg
      viewBox="0 0 340 80"
      width={s.width}
      height={s.height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="entur-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF1744" />
          <stop offset="100%" stopColor="#AA00FF" />
        </linearGradient>
        <linearGradient id="entur-grad-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF1744" />
          <stop offset="100%" stopColor="#D500F9" />
        </linearGradient>
      </defs>

      {/* EN */}
      <text
        x="0"
        y="54"
        fontFamily="var(--font-poppins), Poppins, sans-serif"
        fontWeight="700"
        fontSize="52"
        letterSpacing="-1"
        fill="rgba(255,255,255,0.9)"
      >
        EN
      </text>

      {/* Stylized T — 3 horizontal bars with gradient */}
      {/* Top bar (wide, red) */}
      <rect x="108" y="14" width="60" height="10" rx="2" fill="#FF1744" />
      {/* Middle bar (medium, gradient) */}
      <rect
        x="118"
        y="28"
        width="40"
        height="9"
        rx="2"
        fill="url(#entur-grad-h)"
      />
      {/* Stem + bottom block (purple) */}
      <rect
        x="128"
        y="40"
        width="20"
        height="20"
        rx="2"
        fill="url(#entur-grad)"
      />

      {/* UR */}
      <text
        x="158"
        y="54"
        fontFamily="var(--font-poppins), Poppins, sans-serif"
        fontWeight="700"
        fontSize="52"
        letterSpacing="-1"
        fill="rgba(255,255,255,0.9)"
      >
        UR
      </text>

      {/* Tagline */}
      {showTagline && (
        <text
          x="248"
          y="38"
          fontFamily="var(--font-poppins), Poppins, sans-serif"
          fontWeight="400"
          fontSize="9"
          letterSpacing="0.5"
          fill="rgba(255,255,255,0.4)"
        >
          <tspan x="248" dy="0">
            ESCOLA DE NEGOCIOS
          </tspan>
          <tspan x="248" dy="12">
            DO TURISMO.
          </tspan>
        </text>
      )}
    </svg>
  );
}
