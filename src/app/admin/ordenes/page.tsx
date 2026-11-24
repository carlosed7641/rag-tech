import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";
import { orderStatusLabel } from "@/lib/order-status";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, total, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold tracking-[-0.03em] text-ink">Órdenes</h1>

      <div className="overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-line bg-surface text-left eyebrow text-muted">
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/ordenes/${o.id}`}
                    className="font-medium text-ink hover:text-accent"
                  >
                    #{o.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(o.created_at).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-ink">{orderStatusLabel(o.status)}</td>
                <td className="px-4 py-3 font-semibold text-ink">
                  {formatCurrency(Number(o.total))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted">
            Todavía no hay órdenes.
          </p>
        )}
      </div>
    </div>
  );
}
