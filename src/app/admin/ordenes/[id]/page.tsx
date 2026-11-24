import { BackLink } from "@/components/ui/BackLink";
import { notFound } from "next/navigation";
import { getOrderWithItems } from "@/lib/orders";
import { OrderReceipt } from "@/components/orders/OrderReceipt";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrderWithItems(id);
  if (!result) notFound();
  const { order, items } = result;

  const address = order.shipping_address as Record<string, string> | null;

  return (
    <div className="max-w-xl">
      <BackLink href="/admin/ordenes">Volver a órdenes</BackLink>
      <h1 className="mb-1 text-3xl font-bold tracking-[-0.03em] text-ink">
        Orden #{order.id.slice(0, 8)}
      </h1>
      <p className="mb-8 text-sm text-muted">
        {new Date(order.created_at).toLocaleString("es-CO")}
      </p>

      <OrderStatusForm orderId={order.id} currentStatus={order.status} />

      {address && (
        <div className="mb-8 rounded-2xl border border-line bg-card p-4 text-sm text-ink">
          <p className="mb-1 eyebrow text-muted">
            Dirección de envío
          </p>
          <p>{address.line1}</p>
          <p>
            {address.city}
            {address.state ? `, ${address.state}` : ""} · {address.zip}
          </p>
        </div>
      )}

      <OrderReceipt order={order} items={items} />
    </div>
  );
}
