"use client";

import { useState } from "react";
import { DEPARTAMENTOS_CO } from "@/lib/colombia";

type Props = {
  name?: string;
  /** Modo controlado (checkout). */
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Modo no controlado (formularios de /cuenta). */
  defaultValue?: string;
  className?: string;
};

/**
 * Selector de departamento de Colombia, compartido por el checkout y los
 * formularios de dirección de /cuenta. El departamento es opcional (la
 * primera opción vale "").
 *
 * Si la dirección guardada tiene un valor que no está en la lista (direcciones
 * creadas cuando el campo era texto libre), se agrega como opción extra para
 * no perder el dato al editar.
 */
export function DepartmentSelect({
  name = "state",
  value,
  onChange,
  defaultValue,
  className = "",
}: Props) {
  // En modo no controlado se guarda la selección localmente solo para pintar
  // el texto gris (sin elegir) o normal (elegido).
  const [local, setLocal] = useState(defaultValue ?? "");
  const controlled = value !== undefined;
  const current = controlled ? value : local;
  const initial = controlled ? value : (defaultValue ?? "");
  const legacy =
    initial && !(DEPARTAMENTOS_CO as readonly string[]).includes(initial) ? initial : null;

  return (
    <div className={`relative ${className}`}>
      <select
        name={name}
        aria-label="Departamento"
        {...(controlled
          ? { value, onChange }
          : { defaultValue, onChange: (e) => setLocal(e.target.value) })}
        className={`w-full cursor-pointer appearance-none rounded-[11px] border border-line-strong bg-card py-2.5 pl-3.5 pr-10 text-sm outline-none focus:border-ink focus:ring-[3px] focus:ring-mint ${
          current ? "text-ink" : "text-muted"
        }`}
      >
        <option value="">Departamento</option>
        {legacy && <option value={legacy}>{legacy}</option>}
        {DEPARTAMENTOS_CO.map((d) => (
          <option key={d} value={d} className="text-ink">
            {d}
          </option>
        ))}
      </select>
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
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
