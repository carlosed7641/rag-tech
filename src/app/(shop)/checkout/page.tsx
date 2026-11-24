import { BackLink } from "@/components/ui/BackLink";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts ya protege esta ruta, pero por si acaso.
  if (!user) return null;

  // Los admins no pueden comprar (la DB también lo rechaza, ver
  // supabase/migrations). Se van al panel en vez de ver el checkout.
  const { isAdmin } = await getViewer();
  if (isAdmin) redirect("/admin");

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-8">
      <BackLink href="/carrito">Volver al carrito</BackLink>
      <h1 className="mb-9 text-[32px] font-bold leading-tight tracking-[-0.03em] text-ink md:text-[40px]">Checkout</h1>
      <CheckoutForm addresses={addresses ?? []} userId={user.id} />
    </div>
  );
}
