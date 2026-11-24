import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";
import { LogoutButton } from "@/components/account/LogoutButton";
import { AddAddressForm } from "@/components/account/AddAddressForm";
import { AddressItem } from "@/components/account/AddressItem";
import { orderStatusLabel } from "@/lib/order-status";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts ya protege esta ruta, pero por si acaso.
  if (!user) return null;

  // Un admin no tiene cuenta de cliente (no compra): su "cuenta" es el panel.
  const { isAdmin } = await getViewer();
  if (isAdmin) redirect("/admin");

  const [{ data: profile }, { data: orders }, { data: addresses }] =
    await Promise.all([
      supabase.from("profiles").select("full_name, role").eq("id", user.id).single(),
      // Filtrado explícito por user_id: la política RLS de "orders" también
      // deja pasar a los admins (para que /admin vea cualquier orden), así
      // que sin este filtro un cliente que además es admin vería el
      // historial de TODOS los usuarios en su propia cuenta.
      supabase
        .from("orders")
        .select("id, status, total, created_at, order_items(product_name, quantity)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="break-words text-[32px] font-bold leading-tight tracking-[-0.03em] text-ink md:text-[40px]">
            {profile?.full_name || "Mi cuenta"}
          </h1>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <section className="mb-12">
        <h2 className="mb-4 eyebrow text-muted">
          Direcciones
        </h2>
        <div className="flex flex-col gap-3">
          {addresses && addresses.length > 0 && (
            <ul className="flex flex-col gap-2">
              {addresses.map((a) => (
                <li key={a.id}>
                  <AddressItem address={a} />
                </li>
              ))}
            </ul>
          )}
          <AddAddressForm userId={user.id} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 eyebrow text-muted">
          Historial de órdenes
        </h2>
        {!orders || orders.length === 0 ? (
          <p className="text-sm text-muted">Todavía no tienes órdenes.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {orders.map((o) => {
              const preview = o.order_items
                .map((i) => `${i.product_name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`)
                .join(", ");
              return (
                <li key={o.id}>
                  <Link
                    href={`/cuenta/ordenes/${o.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-line bg-card px-4 py-3 hover:ring-2 hover:ring-accent"
                  >
                    <div className="min-w-0">
                      <div>
                        <span className="text-xs text-muted">
                          {new Date(o.created_at).toLocaleDateString("es-CO", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="ml-3 text-xs font-medium text-signal">
                          {orderStatusLabel(o.status)}
                        </span>
                      </div>
                      {preview && (
                        <p className="mt-1 truncate text-sm text-ink">{preview}</p>
                      )}
                    </div>
                    <span className="flex-none text-sm font-semibold text-ink">
                      {formatCurrency(o.total)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
