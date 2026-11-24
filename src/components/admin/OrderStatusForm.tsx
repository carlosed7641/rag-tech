"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import {
  updateOrderStatus,
  type UpdateOrderStatusState,
} from "@/app/admin/ordenes/actions";
import { ORDER_STATUSES } from "@/lib/order-status";

/**
 * Cambia el estado de una orden desde /admin/ordenes/[id].
 * - `pending` de useActionState deshabilita el botón mientras se guarda
 *   (evita peticiones repetidas).
 * - Se envía con onSubmit + startTransition en vez de `<form action>`:
 *   con `action`, React 19 reinicia el formulario al terminar y el <select>
 *   volvía visualmente al estado inicial aunque estuviera controlado.
 */
export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useActionState<UpdateOrderStatusState, FormData>(
    updateOrderStatus.bind(null, orderId),
    { status: currentStatus, ok: null, message: null },
  );
  const [selected, setSelected] = useState(currentStatus);
  const unchanged = selected === state.status;

  // El mensaje de éxito se oculta solo a los 4,5 s. Se guarda qué resultado
  // ya se descartó (no un booleano): cada guardado nuevo es otro objeto
  // `state`, así que vuelve a mostrarse sin tener que reiniciar nada.
  const [dismissed, setDismissed] = useState<UpdateOrderStatusState | null>(null);
  useEffect(() => {
    if (!state.ok) return;
    const timer = setTimeout(() => setDismissed(state), 4500);
    return () => clearTimeout(timer);
  }, [state]);

  const showMessage =
    !pending &&
    Boolean(state.message) &&
    (state.ok === false || (unchanged && dismissed !== state));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="mb-8 flex flex-col gap-2"
    >
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-ink" htmlFor="status">
          Estado:
        </label>
        <select
          id="status"
          name="status"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={pending}
          className="input w-auto"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending || unchanged}
          className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-ink disabled:bg-line-strong disabled:text-muted"
        >
          {pending ? "Actualizando…" : "Actualizar"}
        </button>
      </div>
      <p
        aria-live="polite"
        className={`min-h-5 text-xs ${state.ok === false ? "text-danger" : "text-accent"}`}
      >
        {showMessage && state.message}
      </p>
    </form>
  );
}
