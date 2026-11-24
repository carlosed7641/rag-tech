import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/products";
import { formatCurrency } from "@/lib/format";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductAsk } from "@/components/chat/ProductAsk";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const inStock = product.stock > 0;
  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : null;

  const specs: [string, string][] = [
    ...(product.categories ? [["Categoría", product.categories.name] as [string, string]] : []),
    ...(product.material ? [["Material", product.material] as [string, string]] : []),
    ...(product.tags.length > 0 ? [["Características", product.tags.join(", ")] as [string, string]] : []),
    ["Disponibilidad", inStock ? `${product.stock} en stock` : "Agotado"],
    ["Referencia", product.slug],
  ];

  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-14 px-4 pb-24 pt-7 md:px-6">
      <nav aria-label="Ruta" className="flex flex-wrap gap-2 tabular-nums text-[13px] text-muted">
        <Link href="/productos" className="hover:text-ink">
          Catálogo
        </Link>
        {product.categories && (
          <>
            <span aria-hidden="true">/</span>
            <Link
              href={`/productos?category=${product.categories.slug}`}
              className="hover:text-ink"
            >
              {product.categories.name}
            </Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="flex flex-wrap items-start gap-12">
        <div className="min-w-0 flex-[1_1_520px]">
          <ProductGallery images={product.images} name={product.name} discount={discount} />
        </div>

        <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-6">
          <div className="flex flex-col gap-2.5">
            {product.categories && (
              <span className="eyebrow text-accent">{product.categories.name}</span>
            )}
            <h1 className="break-words text-balance text-4xl font-bold leading-none tracking-[-0.035em] md:text-[56px]">
              {product.name}
            </h1>
            <p className="max-w-[52ch] text-lg text-muted">{product.description}</p>
          </div>

          {product.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md bg-mint-soft px-2.5 py-1.5 tabular-nums text-[13px] text-[#14532d]"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-5 rounded-2xl border border-line bg-card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold tracking-[-0.02em]">
                  {formatCurrency(product.price)}
                </span>
                {product.compare_at_price && (
                  <span className="text-base text-muted line-through">
                    {formatCurrency(product.compare_at_price)}
                  </span>
                )}
              </div>
              <span
                className={`flex items-center gap-2 text-sm font-medium ${
                  inStock ? "text-accent" : "text-muted"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${inStock ? "bg-leaf" : "bg-muted"}`} />
                {inStock ? `${product.stock} en stock` : "Agotado"}
              </span>
            </div>

            <AddToCartButton product={product} />

            <dl className="grid grid-cols-3 gap-2 border-t border-line pt-4">
              <MiniSpec k="Envío" v="24 horas" />
              <MiniSpec k="Garantía" v="2 años" />
              <MiniSpec k="Devolución" v="30 días" />
            </dl>
          </div>
        </div>
      </div>

      <section className="flex flex-wrap items-stretch gap-4">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-5 rounded-2xl border border-line bg-card p-7">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[28px] font-bold">Ficha técnica</h2>
          </div>
          <dl className="grid grid-cols-[minmax(120px,1fr)_2fr] tabular-nums text-sm">
            {specs.map(([k, v], i) => (
              <div key={k} className="contents">
                <dt
                  className={`border-t border-line py-3.5 pr-3 text-muted ${
                    i === specs.length - 1 ? "border-b" : ""
                  }`}
                >
                  {k}
                </dt>
                <dd
                  className={`break-words border-t border-line py-3.5 first-letter:uppercase ${
                    i === specs.length - 1 ? "border-b" : ""
                  }`}
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex min-w-0 flex-[1_1_400px]">
          <ProductAsk productName={product.name} />
        </div>
      </section>
    </div>
  );
}

function MiniSpec({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="eyebrow text-[11px] text-muted">{k}</dt>
      <dd className="text-sm font-semibold">{v}</dd>
    </div>
  );
}
