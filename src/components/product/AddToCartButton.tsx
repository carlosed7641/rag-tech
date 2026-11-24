"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/lib/products";
import { ADMIN_CANNOT_BUY, useViewer } from "@/components/layout/ViewerContext";

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;
  const { isAdmin } = useViewer();

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? null,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  if (isAdmin) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled
          aria-describedby="admin-cannot-buy"
          className="h-[52px] w-full rounded-[11px] bg-line-strong px-6 text-base font-semibold text-muted"
        >
          Añadir al carrito
        </button>
        <p id="admin-cannot-buy" className="text-xs text-muted">
          {ADMIN_CANNOT_BUY}
        </p>
      </div>
    );
  }

  if (outOfStock) {
    return (
      <button
        disabled
        className="h-[52px] w-full rounded-[11px] bg-surface px-6 text-sm font-semibold text-muted"
      >
        Agotado
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex h-[52px] items-center overflow-hidden rounded-[11px] border border-line-strong">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="h-full w-12 bg-surface text-lg text-ink hover:text-accent"
          aria-label="Reducir cantidad"
        >
          −
        </button>
        <span className="w-12 text-center tabular-nums text-base text-ink">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
          className="h-full w-12 bg-surface text-lg text-ink hover:text-accent"
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="h-[52px] flex-[1_1_200px] rounded-[11px] bg-accent px-6 text-base font-semibold text-white transition-colors hover:bg-accent-ink"
      >
        {added ? "Añadido ✓" : "Añadir al carrito"}
      </button>
    </div>
  );
}
