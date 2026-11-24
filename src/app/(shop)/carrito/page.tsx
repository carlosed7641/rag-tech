"use client";

import Link from "next/link";
import { useCartStore, useCartSubtotal } from "@/store/cart";
import { useIsClient } from "@/lib/useIsClient";
import { formatCurrency } from "@/lib/format";
import { ArrowRightIcon, TrashIcon } from "@/components/ui/icons";
import { ADMIN_CANNOT_BUY, useViewer } from "@/components/layout/ViewerContext";

export default function CartPage() {
  const isClient = useIsClient();
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartSubtotal();
  const { isAdmin } = useViewer();

  if (!isClient) {
    // Evita parpadeo/mismatch mientras se lee localStorage
    return <div className="mx-auto max-w-4xl px-4 py-14 md:px-8" />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-8">
      <h1 className="mb-9 text-[32px] font-bold leading-tight tracking-[-0.03em] text-ink md:text-[40px]">Carrito</h1>

      {items.length === 0 ? (
        <div className="py-16 text-center text-muted">
          <p>Tu carrito está vacío.</p>
          <Link href="/productos" className="mt-3 inline-block font-semibold text-accent hover:text-accent-ink">
            Ver catálogo →
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-5 border-y border-line py-6">
            {items.map((item) => (
              <li key={item.productId} className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <div className="flex min-w-[200px] flex-1 items-center gap-4">
                  <div className="h-16 w-16 flex-none overflow-hidden rounded-xl bg-surface">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                    )}
                  </div>
                  <div>
                    <Link href={`/productos/${item.slug}`} className="text-sm font-semibold text-ink hover:text-accent">
                      {item.name}
                    </Link>
                    <div className="mt-1 text-xs text-muted">
                      {formatCurrency(item.price)} c/u
                    </div>
                  </div>
                </div>

                <div className="ml-auto flex items-center gap-4 sm:ml-0">
                  <div className="flex items-center rounded-xl border border-line-strong">
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="px-2.5 py-1.5 text-sm text-ink hover:text-accent"
                      aria-label="Reducir cantidad"
                    >
                      −
                    </button>
                    <span className="min-w-[2ch] text-center text-sm text-ink">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      className="px-2.5 py-1.5 text-sm text-ink hover:text-accent"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                  <span className="min-w-[6ch] text-right text-sm font-semibold text-ink">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    aria-label={`Quitar ${item.name} del carrito`}
                    title="Quitar del carrito"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-end gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="text-lg font-bold text-ink">{formatCurrency(subtotal)}</span>
            </div>
            {isAdmin ? (
              <>
                <span
                  aria-disabled="true"
                  className="flex items-center gap-3 rounded-xl bg-line-strong px-8 py-3 text-sm font-semibold text-muted"
                >
                  Proceder al pago
                  <ArrowRightIcon size={16} />
                </span>
                <p className="text-xs text-muted">{ADMIN_CANNOT_BUY}</p>
              </>
            ) : (
              <Link
                href="/checkout"
                className="flex items-center gap-3 rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-ink"
              >
                Proceder al pago
                <ArrowRightIcon size={16} />
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
