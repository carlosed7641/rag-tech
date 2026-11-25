import Link from "next/link";
import {
  getFeaturedProducts,
  getBestSellers,
  getCategories,
  getProductsBySlugs,
} from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { HeroShowcase, type HeroProduct } from "@/components/home/HeroShowcase";
import { TryAssistantButton } from "@/components/chat/TryAssistantButton";
import { CATEGORY_ICONS, PlugIcon } from "@/components/ui/icons";

// Descriptor corto por categoría (slug de `categories`). Si aparece una
// categoría nueva sin entrada aquí, la tarjeta simplemente no muestra subtítulo.
const CATEGORY_BLURB: Record<string, string> = {
  audio: "Auriculares, bocinas, micrófonos",
  computo: "Teclados, mouse, docks",
  "hogar-inteligente": "Focos, cámaras, sensores",
  gaming: "Controles, headsets, captura",
  fotografia: "Gimbals, trípodes, luces",
  accesorios: "Power banks, cargadores, cables",
};

// Productos del hero (vitrina). Se editan aquí: los slugs que no existan o
// estén inactivos se omiten solos.
const HERO_SLIDE_SLUGS = ["audifonos-modernos", "ragtech-boom-40", "ragtech-type-60"];
const HERO_SIDE_SLUGS = ["ragtech-pad-x", "ragtech-glide-pro"];

const STEPS = [
  {
    title: "Lo describes",
    body: "Con tus palabras: uso, presupuesto, lo que no quieres. No hace falta saber el nombre del producto.",
  },
  {
    title: "Busca por significado",
    body: "Compara tu pedido con las descripciones y especificaciones de todo el catálogo, y filtra por precio y stock real.",
  },
  {
    title: "Comparas y compras",
    body: "Te muestra tarjetas con los productos que encajan, listas para abrir y agregar al carrito.",
  },
  {
    title: "Sigues tu pedido",
    body: "Con tu sesión iniciada, pregúntale por el estado de tus órdenes. Solo ve las tuyas.",
  },
];

export default async function HomePage() {
  const [featured, bestSellers, categories, heroRows] = await Promise.all([
    getFeaturedProducts(4),
    getBestSellers(4),
    getCategories(),
    getProductsBySlugs([...HERO_SLIDE_SLUGS, ...HERO_SIDE_SLUGS]),
  ]);

  const toHero = (p: (typeof heroRows)[number]): HeroProduct => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    image: p.images[0] ?? null,
    category: p.categories?.name ?? null,
  });
  const heroSlides = heroRows.filter((p) => HERO_SLIDE_SLUGS.includes(p.slug)).map(toHero);
  const heroSide = heroRows.filter((p) => HERO_SIDE_SLUGS.includes(p.slug)).map(toHero);

  // La primera categoría (Audio si existe) ocupa el bloque grande del bento.
  const ordered = [
    ...categories.filter((c) => c.slug === "audio"),
    ...categories.filter((c) => c.slug !== "audio"),
  ];
  const [hero, ...rest] = ordered;

  return (
    <>
      <HeroShowcase slides={heroSlides} side={heroSide} />

      <section aria-label="Garantías" className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 px-4 md:grid-cols-4 md:px-6">
          <SpecItem k="Envío" v="24 horas" />
          <SpecItem k="Garantía" v="2 años" />
          <SpecItem k="Devolución" v="30 días" />
          <SpecItem k="Soporte" v="7 días / semana" />
        </div>
      </section>

      {hero && (
        <section className="mx-auto max-w-[1240px] px-4 pb-10 pt-20 md:px-6 md:pt-22">
          <SectionHead eyebrow="Explora" title={`${categories.length} categorías, una sola ficha`} />
          <div className="grid auto-rows-[180px] grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[200px]">
            <CategoryTile category={hero} big />
            {rest.map((c, i) => (
              <CategoryTile
                key={c.id}
                category={c}
                highlight={i === 2}
                // Con 5 categorías chicas, la última ocupa 2 columnas para cerrar la grilla.
                wide={i === rest.length - 1 && rest.length % 3 === 2}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1240px] px-4 py-14 md:px-6">
        <SectionHead eyebrow="Recién llegados" title="Especificaciones claras, sin relleno" />
        <ProductGrid products={featured} label="Recién llegados" />
      </section>

      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-4 pb-24 pt-4 md:px-6">
          <SectionHead eyebrow="Más vendidos" title="Lo que más se llevan" />
          <ProductGrid products={bestSellers} label="Más vendidos" />
        </section>
      )}

      <section className="bg-ink text-line">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-12 px-4 py-24 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex max-w-2xl flex-col gap-2.5">
              <span className="eyebrow text-lime">Cómo funciona</span>
              <h2 className="text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-white md:text-[44px]">
                Un asistente que lee las fichas, no que adivina.
              </h2>
            </div>
            <TryAssistantButton />
          </div>
          <ol className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="flex flex-col gap-3.5 rounded-2xl border border-white/[0.06] bg-forest p-6"
              >
                <span className="tabular-nums text-[13px] text-lime">/0{i + 1}</span>
                <span className="font-display text-[22px] font-semibold text-white">{s.title}</span>
                <span className="text-[15px] text-sage">{s.body}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <span className="eyebrow text-accent">{eyebrow}</span>
        <h2 className="text-3xl font-bold leading-[1.05] tracking-[-0.03em] md:text-[40px]">{title}</h2>
      </div>
      <Link href="/productos" className="text-[15px] font-semibold text-accent hover:text-ink">
        Ver todo el catálogo →
      </Link>
    </div>
  );
}

/**
 * Vitrina de productos.
 * - Móvil (< md): slider horizontal con CSS scroll snap (sin JS ni librerías).
 *   Se ven 2 tarjetas y asoma la tercera para indicar que se puede deslizar;
 *   llega a los bordes de la pantalla pero la primera tarjeta queda alineada
 *   con el margen del contenido (scroll-padding).
 * - Desde md: grilla de 2 / 4 columnas.
 */
function ProductGrid({
  products,
  label,
}: {
  products: Parameters<typeof ProductCard>[0]["product"][];
  label: string;
}) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 outline-none focus-visible:ring-2 focus-visible:ring-focus md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:p-0 lg:grid-cols-4"
    >
      {products.map((p) => (
        // Ancho: mitad del área visible menos el gap y un margen para que asome
        // la siguiente tarjeta. `grid` hace que la tarjeta llene el alto de la fila.
        <div key={p.id} className="grid w-[calc(50%-22px)] flex-none snap-start md:w-auto">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}

function CategoryTile({
  category,
  big,
  highlight,
  wide,
}: {
  category: { slug: string; name: string };
  big?: boolean;
  highlight?: boolean;
  wide?: boolean;
}) {
  const Icon = CATEGORY_ICONS[category.slug] ?? PlugIcon;
  const href = `/productos?category=${category.slug}`;
  const blurb = CATEGORY_BLURB[category.slug];

  if (big) {
    return (
      <Link
        href={href}
        // Móvil: grilla de 2 columnas (texto a la izquierda, ícono a la
        // derecha). Desde sm: columna con el ícono centrado.
        className="group grid grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-x-4 overflow-hidden rounded-2xl bg-forest p-6 text-line sm:col-span-2 sm:row-span-2 sm:flex sm:flex-col sm:gap-4 sm:p-7 lg:col-span-1"
      >
        <span className="eyebrow col-start-1 row-start-1 text-sage">Categoría destacada</span>
        <div className="col-start-2 row-span-2 row-start-1 flex items-center justify-center sm:min-h-0 sm:flex-1">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-lime/10 text-lime ring-1 ring-lime/20 transition-colors group-hover:bg-lime/15 sm:h-32 sm:w-32 lg:h-40 lg:w-40">
            <Icon size={64} strokeWidth={1.4} className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20" />
          </span>
        </div>
        <div className="col-start-1 row-start-2 flex min-w-0 flex-col justify-end gap-1.5">
          <span className="font-display text-4xl font-bold tracking-[-0.02em] text-white">
            {category.name}
          </span>
          {blurb && <span className="text-[15px] text-sage">{blurb}</span>}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`group flex flex-col justify-between rounded-2xl p-5 transition-colors ${
        wide ? "sm:col-span-2" : ""
      } ${
        highlight
          ? "bg-mint hover:bg-[#c9f5d7]"
          : "border border-line bg-card hover:border-line-strong"
      }`}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
          highlight ? "bg-card text-[#14532d]" : "bg-mint-soft text-accent"
        }`}
      >
        <Icon size={26} strokeWidth={1.6} />
      </span>
      <div>
        <div className="font-display text-[22px] font-semibold">{category.name}</div>
        {blurb && (
          <div className={`text-sm ${highlight ? "text-[#14532d]" : "text-muted"}`}>{blurb}</div>
        )}
      </div>
    </Link>
  );
}

function SpecItem({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-1 border-line py-5 pr-4 md:flex-row md:items-baseline md:justify-between md:gap-3 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
      <span className="eyebrow text-muted">{k}</span>
      <span className="font-display text-lg font-semibold md:text-xl">{v}</span>
    </div>
  );
}
