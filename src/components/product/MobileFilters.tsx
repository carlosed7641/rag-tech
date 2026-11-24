"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * Envuelve el panel de filtros del catálogo. En móvil (< md) queda oculto
 * detrás de un botón que lo despliega; desde md siempre está visible.
 *
 * Se cierra solo al aplicar un filtro porque la página le pasa un `key`
 * derivado de los searchParams: al cambiar la URL, React lo vuelve a montar
 * con `open = false`.
 */
export function MobileFilters({
  activeCount,
  children,
}: {
  activeCount: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex h-11 w-full items-center justify-between gap-3 rounded-[11px] border border-line-strong bg-card px-4 text-sm font-semibold text-ink transition-colors hover:border-accent md:hidden"
      >
        <span className="flex items-center gap-2.5">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" />
            <circle cx="16" cy="6" r="2" />
            <circle cx="10" cy="12" r="2" />
            <circle cx="18" cy="18" r="2" />
          </svg>
          Filtros
          {activeCount > 0 && (
            <span className="rounded-md bg-mint px-1.5 py-px text-xs tabular-nums text-accent-ink">
              {activeCount}
            </span>
          )}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        id={panelId}
        className={`${
          open ? "mt-3 block rounded-2xl border border-line bg-card p-5" : "hidden"
        } md:mt-0 md:block md:rounded-none md:border-0 md:bg-transparent md:p-0`}
      >
        {children}
      </div>
    </div>
  );
}
