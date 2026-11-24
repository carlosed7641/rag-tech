"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore, useCartSubtotal } from "@/store/cart";
import { useIsClient } from "@/lib/useIsClient";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { addressSchema } from "@/lib/schemas/address";

// Valores crudos del formulario (todo texto); addressSchema los valida.
type AddressFields = { line1: string; city: string; state: string; zip: string };
import { DepartmentSelect } from "@/components/account/DepartmentSelect";

type Address = Tables<"addresses">;

export function CheckoutForm({
  addresses,
  userId,
}: {
  addresses: Address[];
  userId: string;
}) {
  const router = useRouter();
  const isClient = useIsClient();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const subtotal = useCartSubtotal();

  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">(
    addresses[0]?.id ?? "new",
  );
  // Campos de la dirección nueva (controlados para poder habilitar/deshabilitar
  // el botón según estén completos los obligatorios).
  const [newAddress, setNewAddress] = useState<AddressFields>({
    line1: "",
    city: "",
    state: "",
    zip: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [pending, setPending] = useState(false);
  // Orden ya creada y navegando a la confirmación: muestra un loader en vez
  // del carrito (que se vacía en ese momento) para no mostrar "carrito vacío".
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isClient) return null;

  // Con una dirección guardada seleccionada no hay nada que completar; con
  // "dirección nueva", deben estar los campos obligatorios del schema.
  const addressComplete =
    selectedAddressId !== "new" || addressSchema.safeParse(newAddress).success;

  function updateField(field: keyof AddressFields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setNewAddress((a) => ({ ...a, [field]: e.target.value }));
  }

  if (redirecting) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-4 py-20 text-center"
      >
        <span
          aria-hidden="true"
          className="h-10 w-10 animate-spin rounded-full border-[3px] border-mint border-t-accent"
        />
        <p className="font-display text-xl font-semibold text-ink">Confirmando tu pedido…</p>
        <p className="text-sm text-muted">Esto toma solo unos segundos.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-muted">
        Tu carrito está vacío — no hay nada que pagar.
      </p>
    );
  }

  async function handleSubmit() {
    setPending(true);
    setError(null);

    const parsedNew = addressSchema.safeParse(newAddress);
    const shippingAddress =
      selectedAddressId === "new"
        ? {
            line1: parsedNew.data?.line1 ?? "",
            city: parsedNew.data?.city ?? "",
            state: parsedNew.data?.state || null,
            zip: parsedNew.data?.zip ?? "",
            country: "CO",
          }
        : (() => {
            const a = addresses.find((x) => x.id === selectedAddressId)!;
            return {
              line1: a.line1,
              city: a.city,
              state: a.state,
              zip: a.zip,
              country: a.country,
            };
          })();

    if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.zip) {
      setError("Completa la dirección de envío.");
      setPending(false);
      return;
    }

    const supabase = createClient();
    const { data: orderId, error: rpcError } = await supabase.rpc("create_order", {
      p_items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
      p_shipping_address: shippingAddress,
      p_coupon_code: couponCode.trim() || undefined,
    });

    if (rpcError) {
      setPending(false);
      setError(rpcError.message);
      return;
    }

    // A partir de aquí la orden existe: el loader reemplaza al formulario
    // hasta que cargue la página de confirmación.
    setRedirecting(true);

    // Si el usuario escribió una dirección nueva, la guardamos en su
    // libreta de direcciones para que le quede disponible en /cuenta y en
    // el próximo checkout — antes solo quedaba dentro de esta orden.
    // Best-effort: si falla, no bloquea la confirmación de la compra.
    if (selectedAddressId === "new") {
      await supabase.from("addresses").insert({
        user_id: userId,
        line1: shippingAddress.line1,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zip,
        country: shippingAddress.country,
        is_default: addresses.length === 0,
      });
    }

    router.push(`/checkout/confirmacion/${orderId}`);
    clearCart();
  }

  return (
    <form action={handleSubmit} className="grid gap-10 md:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="mb-3 eyebrow text-muted">
            Dirección de envío
          </h2>
          <div className="flex flex-col gap-2">
            {addresses.map((a) => (
              <label
                key={a.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-card px-4 py-3 text-sm has-checked:ring-2 has-checked:ring-accent"
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === a.id}
                  onChange={() => setSelectedAddressId(a.id)}
                  className="mt-1 accent-accent"
                />
                <span>
                  {a.line1}, {a.city}
                  {a.state ? `, ${a.state}` : ""} — {a.zip}
                </span>
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-card px-4 py-3 text-sm has-checked:ring-2 has-checked:ring-accent">
              <input
                type="radio"
                name="address"
                checked={selectedAddressId === "new"}
                onChange={() => setSelectedAddressId("new")}
                className="accent-accent"
              />
              Usar una dirección nueva
            </label>
          </div>

          {selectedAddressId === "new" && (
            <div className="mt-3 flex flex-col gap-3">
              <input
                name="line1"
                required
                aria-required="true"
                value={newAddress.line1}
                onChange={updateField("line1")}
                placeholder="Calle y número *"
                className="rounded-[11px] border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-ink focus:ring-[3px] focus:ring-mint"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="city"
                  required
                  aria-required="true"
                  value={newAddress.city}
                  onChange={updateField("city")}
                  placeholder="Ciudad *"
                  className="rounded-[11px] border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-ink focus:ring-[3px] focus:ring-mint"
                />
                <DepartmentSelect
                  value={newAddress.state}
                  onChange={(e) => setNewAddress((a) => ({ ...a, state: e.target.value }))}
                />
              </div>
              <input
                name="zip"
                required
                aria-required="true"
                value={newAddress.zip}
                onChange={updateField("zip")}
                placeholder="Código postal *"
                className="rounded-[11px] border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-ink focus:ring-[3px] focus:ring-mint"
              />
              <p className="text-xs text-muted">* Campos obligatorios</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 eyebrow text-muted">
            Cupón (opcional)
          </h2>
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Código de descuento"
            className="w-full max-w-xs rounded-[11px] border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-ink focus:ring-[3px] focus:ring-mint"
          />
        </div>
      </div>

      <div className="flex h-fit flex-col gap-4 rounded-2xl border border-line bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="eyebrow text-muted">Resumen</h2>
          <Link
            href="/carrito"
            className="text-xs font-semibold text-accent hover:text-accent-ink"
          >
            Editar<span className="sr-only"> carrito</span>
          </Link>
        </div>
        <ul className="flex flex-col gap-2 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-2">
              <span className="text-ink">
                {i.name} × {i.quantity}
              </span>
              <span className="text-muted">
                {formatCurrency(i.price * i.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-line pt-3 text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="font-semibold text-ink">{formatCurrency(subtotal)}</span>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <button
          type="submit"
          disabled={pending || !addressComplete}
          aria-describedby={!addressComplete ? "checkout-missing" : undefined}
          className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-ink disabled:bg-line-strong disabled:text-muted disabled:hover:bg-line-strong"
        >
          {pending ? "Procesando…" : "Confirmar compra"}
        </button>
        {!addressComplete && (
          <p id="checkout-missing" className="text-xs text-muted">
            Completa la dirección de envío para confirmar la compra.
          </p>
        )}
      </div>
    </form>
  );
}
