import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrderWithItems } from "@/lib/orders";
import { OrderReceipt } from "@/components/orders/OrderReceipt";
import { orderStatusLabel } from "@/lib/order-status";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  // Filtrado explícito por user_id, no solo RLS: la política de "orders"
  // también deja pasar a los admins (para /admin), así que un cliente que
  // además es admin no debe ver órdenes ajenas en sus propias páginas.
  const result = await getOrderWithItems(id, { userId: user.id });

  if (!result) notFound();
  const { order, items } = result;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 md:px-8">
      <Link href="/cuenta" className="mb-8 inline-block text-sm text-muted hover:text-ink">
        ← Volver a mi cuenta
      </Link>

      <div className="mb-2 flex items-center gap-3">
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em] text-ink md:text-[40px]">
          Orden #{order.id.slice(0, 8)}
        </h1>
        <span className="text-sm font-medium text-signal">
          {orderStatusLabel(order.status)}
        </span>
      </div>
      <p className="mb-9 text-sm text-muted">
        {new Date(order.created_at).toLocaleDateString("es-CO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <OrderReceipt order={order} items={items} />
    </div>
  );
}
