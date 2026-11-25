import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/products";
import { QuickAddIconButton } from "@/components/product/QuickAddIconButton";

/**
 * Tarjeta de producto.
 * - Móvil (< md): compacta, como las tarjetas bajo el hero: foto, nombre
 *   (máx. 2 líneas), precio y botón. Sin especificaciones.
 * - Desde md: añade la mini ficha (material, clave, stock).
 *
 * Toda la tarjeta lleva a la ficha mediante un enlace "estirado" sobre el
 * título; el botón de carrito va por encima (z-10) para no anidar un <button>
 * dentro de un <a>.
 */
export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0;
  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : null;

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-card p-3 transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-[0_18px_40px_rgba(11,31,22,0.08)] md:p-0">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface md:rounded-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt=""
          className={`h-full w-full object-contain ${outOfStock ? "opacity-60 grayscale" : ""}`}
        />
        {discount && (
          <span className="absolute left-2 top-2 rounded-md bg-ink px-2 py-1 tabular-nums text-xs text-lime md:left-3 md:top-3">
            −{discount}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 pt-3 md:gap-3 md:p-[18px]">
        <h3 className="line-clamp-2 break-words text-[15px] font-semibold leading-tight md:text-xl">
          <Link
            href={`/productos/${product.slug}`}
            className="outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus"
          >
            {product.name}
          </Link>
        </h3>

        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-y border-dashed border-line-strong py-2.5 tabular-nums text-[12.5px] max-md:hidden">
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
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-display text-base font-bold md:text-xl">
              {formatCurrency(product.price)}
            </span>
            {product.compare_at_price && (
              <span className="truncate text-xs text-muted line-through md:text-[13px]">
                {formatCurrency(product.compare_at_price)}
              </span>
            )}
            {outOfStock && <span className="text-xs text-muted md:hidden">Agotado</span>}
          </div>
          <QuickAddIconButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.images[0] ?? null,
              stock: product.stock,
            }}
          />
        </div>
      </div>
    </article>
  );
}
