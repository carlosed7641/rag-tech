/**
 * Estados de una orden: el valor que guarda la DB (`orders.status`) y su
 * etiqueta en español. Fuente única para la tienda (/cuenta), el panel
 * admin y la validación del server action que cambia el estado.
 */
export const ORDER_STATUSES = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagada" },
  { value: "shipped", label: "Enviada" },
  { value: "cancelled", label: "Cancelada" },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]["value"];

export const ORDER_STATUS_VALUES = ORDER_STATUSES.map((s) => s.value) as OrderStatus[];

/** Etiqueta en español; si llega un estado desconocido, se muestra tal cual. */
export function orderStatusLabel(status: string): string {
  return ORDER_STATUSES.find((s) => s.value === status)?.label ?? status;
}
