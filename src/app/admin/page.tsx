import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";
import { orderStatusLabel } from "@/lib/order-status";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [ordersRes, lowStockRes, recentOrdersRes] = await Promise.all([
    supabase.from("orders").select("total, status"),
    supabase
      .from("products")
      .select("id, name, stock")
      .eq("is_active", true)
      .lte("stock", 5)
      .order("stock", { ascending: true })
      .limit(5),
    supabase
      .from("orders")
      .select("id, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const orders = ordersRes.data ?? [];
  const totalVentas = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const lowStock = lowStockRes.data ?? [];
  const recentOrders = recentOrdersRes.data ?? [];

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold tracking-[-0.03em] text-ink">Dashboard</h1>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Ventas totales" value={formatCurrency(totalVentas)} />
        <Stat label="Órdenes" value={String(orders.length)} />
        <Stat label="Productos con poco stock" value={String(lowStock.length)} />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            Órdenes recientes
          </h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted">Todavía no hay órdenes.</p>
          ) : (
            <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/ordenes/${o.id}`}
                    className="flex items-center justify-between px-4 py-3 text-sm hover:bg-surface"
                  >
                    <span className="text-muted">
                      #{o.id.slice(0, 8)} · {orderStatusLabel(o.status)}
                    </span>
                    <span className="font-semibold text-ink">
                      {formatCurrency(Number(o.total))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            Poco stock
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted">Todo el inventario está sano.</p>
          ) : (
            <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className="flex items-center justify-between px-4 py-3 text-sm hover:bg-surface"
                  >
                    <span className="text-ink">{p.name}</span>
                    <span className="font-semibold text-accent">
                      {p.stock} und.
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <p className="mb-1 eyebrow text-muted">
        {label}
      </p>
      <p className="text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
