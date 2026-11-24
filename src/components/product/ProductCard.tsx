import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/products";
import { ArrowRightIcon } from "@/components/ui/icons";

/** Tarjeta tipo "ficha técnica": specs en mono, precio en display. */
export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;
  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : null;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex min-w-0 flex-col self-start overflow-hidden rounded-2xl md:self-stretch border border-line bg-card transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-[0_18px_40px_rgba(11,31,22,0.08)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.name}
          className={`h-full w-full object-contain ${
            outOfStock ? "opacity-60 grayscale" : ""
          }`}
        />
        {discount && (
          <span className="absolute left-3 top-3 rounded-md bg-ink px-2 py-1 tabular-nums text-xs text-lime">
            −{discount}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-[18px]">
        <h3 className="break-words text-lg font-semibold leading-tight sm:text-xl">
          {product.name}
        </h3>

        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-y border-dashed border-line-strong py-2.5 tabular-nums text-[12.5px]">
          {product.material && (
            <>
              <dt className="text-muted">Material</dt>
              <dd className="truncate text-right first-letter:uppercase">{product.material}</dd>
            </>
          )}
          {product.tags[0] && (
            <>
              <dt className="text-muted">Clave</dt>
              <dd className="truncate text-right">{product.tags.slice(0, 2).join(", ")}</dd>
            </>
          )}
          <dt className="text-muted">Stock</dt>
          <dd className={`text-right ${outOfStock ? "text-muted" : "text-accent"}`}>
            {outOfStock ? "Agotado" : `${product.stock} unid.`}
          </dd>
        </dl>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold sm:text-xl">
              {formatCurrency(product.price)}
            </span>
            {product.compare_at_price && (
              <span className="text-[13px] text-muted line-through">
                {formatCurrency(product.compare_at_price)}
              </span>
            )}
          </div>
          <span
            aria-hidden="true"
            className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-ink text-white transition-colors group-hover:bg-accent"
          >
            <ArrowRightIcon size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
