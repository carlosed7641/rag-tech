import Link from "next/link";

/**
 * Isotipo de RagTech: barras ascendentes con línea de tendencia sobre verde
 * bosque. Mismo dibujo que `src/app/icon.svg` (favicon) y `public/logo.svg`;
 * si cambias uno, cambia los tres.
 */
export function LogoMark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={`flex-none ${className}`}
    >
      <rect width="200" height="200" rx="44" fill="#0f2a1d" />
      <g fill="#ffffff">
        <rect x="46" y="124" width="28" height="36" rx="14" />
        <rect x="86" y="104" width="28" height="56" rx="14" />
        <rect x="126" y="84" width="28" height="76" rx="14" />
      </g>
      <path
        d="M44 100 C 80 90, 116 72, 156 44"
        fill="none"
        stroke="#4ade80"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <circle cx="156" cy="44" r="13" fill="#4ade80" />
    </svg>
  );
}

export function Logo({
  href = "/",
  className = "",
  suffix,
}: {
  href?: string;
  className?: string;
  suffix?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={suffix ? `RagTech ${suffix}` : "RagTech, ir al inicio"}
      className={`flex items-center gap-2.5 text-ink ${className}`}
    >
      <LogoMark />
      <span className="font-display text-[21px] font-bold tracking-[-0.02em]">RagTech</span>
      {suffix && (
        <span className="rounded-md bg-mint px-1.5 py-0.5 tabular-nums text-[11px] text-accent-ink">
          {suffix}
        </span>
      )}
    </Link>
  );
}
