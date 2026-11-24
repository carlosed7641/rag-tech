import Link from "next/link";
import {
  listProducts,
  getCategories,
  getPriceBounds,
  type ProductFilters,
} from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { PriceRangeSlider } from "@/components/product/PriceRangeSlider";
import { MobileFilters } from "@/components/product/MobileFilters";

type SearchParams = {
  category?: string;
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? "1") || 1;

  const filters: ProductFilters = {
    categorySlug: sp.category,
    minPrice: sp.min ? Math.max(0, Number(sp.min)) : undefined,
    maxPrice: sp.max ? Math.max(0, Number(sp.max)) : undefined,
    sort:
      sp.sort === "precio_asc" || sp.sort === "precio_desc"
        ? sp.sort
        : "recientes",
    page,
  };

  const [{ products, total, pageSize }, categories, priceBounds] =
    await Promise.all([
      listProducts(filters),
      getCategories(),
      getPriceBounds(),
    ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pageHref(overrides: Partial<SearchParams>) {
    // Ojo: `new URLSearchParams({ page: undefined })` convierte el undefined
    // en el string literal "undefined" (String(undefined)) — por eso se
    // arma el objeto a mano, saltando cualquier valor vacío o undefined.
    const merged: SearchParams = { ...sp, ...overrides };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `/productos?${qs}` : "/productos";
  }

  const hasActiveFilters = Boolean(
    sp.category || sp.min || sp.max || (sp.sort && sp.sort !== "recientes"),
  );
  // Filtros del panel (categoría y rango de precio) para el contador del botón móvil.
  const activeFilterCount = (sp.category ? 1 : 0) + (sp.min || sp.max ? 1 : 0);
  // Cambia con cada filtro aplicado: remonta MobileFilters para que se cierre solo.
  const filtersKey = `${sp.category ?? ""}|${sp.min ?? ""}|${sp.max ?? ""}|${sp.sort ?? ""}`;

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-14 md:px-6">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em] text-ink md:text-[40px]">
          Catálogo
        </h1>
        <span className="text-sm text-muted">
          {total} producto{total === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-[240px_1fr] md:gap-10">
        <aside>
          <MobileFilters key={filtersKey} activeCount={activeFilterCount}>
            <div className="flex flex-col gap-9">
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-ink">
                    Filtro
                  </h2>
                  {hasActiveFilters && (
                    <Link
                      href="/productos"
                      className="text-xs font-semibold text-accent hover:text-accent-ink"
                    >
                      Limpiar filtros
                    </Link>
                  )}
                </div>

                <h3 className="mb-3 eyebrow text-muted">Categoría</h3>
                <ul className="flex flex-col gap-2.5 text-sm">
                  <li>
                    <Link
                      href={pageHref({ category: undefined, page: undefined })}
                      className={
                        !sp.category
                          ? "font-semibold text-accent"
                          : "text-ink hover:text-accent"
                      }
                    >
                      Todas
                    </Link>
                  </li>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={pageHref({ category: c.slug, page: undefined })}
                        className={
                          sp.category === c.slug
                            ? "font-semibold text-accent"
                            : "text-ink hover:text-accent"
                        }
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <form
                className="flex flex-col gap-4"
                action="/productos"
                method="GET"
              >
                {sp.category && (
                  <input type="hidden" name="category" value={sp.category} />
                )}
                {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
                <h3 className="eyebrow text-muted">Rango de precio</h3>
                <PriceRangeSlider
                  boundsMin={priceBounds.min}
                  boundsMax={priceBounds.max}
                  defaultMin={sp.min ? Number(sp.min) : undefined}
                  defaultMax={sp.max ? Number(sp.max) : undefined}
                />
                <button
                  type="submit"
                  className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink/80"
                >
                  Filtrar
                </button>
              </form>
            </div>
          </MobileFilters>
        </aside>

        <div>
          <div className="mb-6 flex justify-end">
            <form
              action="/productos"
              method="GET"
              className="flex items-center gap-2"
            >
              {sp.category && (
                <input type="hidden" name="category" value={sp.category} />
              )}
              {sp.min && <input type="hidden" name="min" value={sp.min} />}
              {sp.max && <input type="hidden" name="max" value={sp.max} />}
              <label className="text-sm text-muted" htmlFor="sort">
                Ordenar
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={sp.sort ?? "recientes"}
                className="cursor-pointer rounded-xl border border-line-strong bg-card px-3 py-1.5 text-sm text-ink outline-none focus:border-accent"
              >
                <option value="recientes">Más recientes</option>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
              </select>
              <button
                type="submit"
                className="rounded-xl border border-line-strong px-3 py-1.5 text-sm text-ink hover:border-accent hover:text-accent"
              >
                Aplicar
              </button>
            </form>
          </div>

          {products.length === 0 ? (
            <p className="py-16 text-center text-muted">
              No encontramos productos con esos filtros.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-7">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4 text-sm">
              <Link
                aria-disabled={page <= 1}
                href={pageHref({ page: String(page - 1) })}
                className={
                  page <= 1
                    ? "pointer-events-none text-muted/40"
                    : "text-ink hover:text-accent"
                }
              >
                ← Anterior
              </Link>
              <span className="text-muted">
                {page} / {totalPages}
              </span>
              <Link
                aria-disabled={page >= totalPages}
                href={pageHref({ page: String(page + 1) })}
                className={
                  page >= totalPages
                    ? "pointer-events-none text-muted/40"
                    : "text-ink hover:text-accent"
                }
              >
                Siguiente →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
