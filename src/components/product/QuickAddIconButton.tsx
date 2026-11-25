"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { ADMIN_CANNOT_BUY, useViewer } from "@/components/layout/ViewerContext";
import { CartPlusIcon, CheckIcon } from "@/components/ui/icons";

/**
 * Botón de ícono para añadir 1 unidad al carrito desde una tarjeta de
 * producto. Va por encima del enlace "estirado" de la tarjeta (`relative z-10`)
 * para no anidar un botón dentro de un <a>.
 */
export function QuickAddIconButton({
  product,
}: {
  product: { id: string; slug: string; name: string; price: number; image: string | null; stock: number };
}) {
  const addItem = useCartStore((s) => s.addItem);
  const { isAdmin } = useViewer();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;
  const disabled = isAdmin || outOfStock;

  const label = isAdmin
    ? ADMIN_CANNOT_BUY
    : outOfStock
      ? `${product.name} está agotado`
      : `Añadir ${product.name} al carrito`;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      title={label}
      onClick={() => {
        addItem({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className={`relative z-10 flex h-9 w-9 flex-none items-center justify-center rounded-[10px] text-white transition-colors md:h-10 md:w-10 md:rounded-[11px] disabled:bg-line-strong disabled:text-muted ${
        added ? "bg-accent" : "bg-ink hover:bg-accent"
      }`}
    >
      {added ? <CheckIcon size={17} /> : <CartPlusIcon size={20} />}
      <span className="sr-only" aria-live="polite">
        {added ? "Añadido al carrito" : ""}
      </span>
    </button>
  );
}
