"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { useChatStore } from "@/store/chat";
import { useViewer } from "@/components/layout/ViewerContext";
import { ChatIcon } from "@/components/ui/icons";

export type HeroProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  category: string | null;
};

const AUTOPLAY_MS = 6000;
/** Distancia mínima (px) de un deslizamiento horizontal para cambiar de slide. */
const SWIPE_THRESHOLD = 50;

/**
 * Hero del home, estilo vitrina: carrusel con un producto destacado a la
 * izquierda y dos tarjetas de producto a la derecha. El asistente queda como
 * una barra secundaria debajo (AssistantBar).
 */
export function HeroShowcase({
  slides,
  side,
}: {
  slides: HeroProduct[];
  side: HeroProduct[];
}) {
  return (
    <section
      aria-label="Destacados"
      className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 pb-14 pt-5 md:px-6 md:pt-6"
    >
      <h1 className="sr-only">RagTech — tienda de tecnología en Colombia</h1>
      <div className="grid gap-4 lg:grid-cols-12">
        {slides.length > 0 && <FeaturedCarousel slides={slides} />}
        {side.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-5 lg:grid-cols-1 lg:grid-rows-2">
            {side.map((p, i) => (
              <SideCard key={p.id} product={p} dark={i === 0} />
            ))}
          </div>
        )}
      </div>
      <AssistantBar />
    </section>
  );
}

function FeaturedCarousel({ slides }: { slides: HeroProduct[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  // Avance automático: se pausa con mouse/foco encima y si el sistema pide
  // reducir animaciones.
  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  const go = (i: number) => setIndex((i + count) % count);

  // Deslizar con el dedo sobre todo el carrusel (móvil). Solo cuenta si el
  // gesto es más horizontal que vertical, para no robarle el scroll a la página.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    setPaused(true);
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    setPaused(false);
    if (!start || count < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? index + 1 : index - 1);
  }

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Producto destacado"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative touch-pan-y overflow-hidden rounded-[20px] bg-mint-soft lg:col-span-7"
    >
      <div className="grid">
        {slides.map((p, i) => (
          <div
            key={p.id}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${count}`}
            aria-hidden={i !== index}
            inert={i !== index}
            className={`col-start-1 row-start-1 transition-opacity duration-500 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Slide product={p} />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 sm:bottom-6 sm:left-10 sm:translate-x-0 lg:left-12">
            {slides.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Ver destacado ${i + 1}: ${p.name}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-ink" : "w-1.5 bg-sage hover:bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="absolute bottom-4 right-4 hidden gap-2 sm:right-6 sm:flex">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Destacado anterior"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-card text-ink hover:border-ink"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Siguiente destacado"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white hover:bg-forest"
            >
              <Chevron dir="right" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Slide({ product }: { product: HeroProduct }) {
  return (
    <div className="flex h-full flex-col-reverse items-stretch gap-4 px-5 pb-12 pt-5 sm:flex-row sm:items-center sm:gap-8 sm:px-10 sm:pb-[4.5rem] sm:pt-8 lg:min-h-[400px] lg:px-10">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {product.category && (
          <span className="eyebrow self-start rounded-full bg-card px-2.5 py-1 text-accent">
            {product.category}
          </span>
        )}
        <h2 className="text-balance text-2xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-[28px] md:text-[40px]">
          {product.name}
        </h2>
        {product.description && (
          <p className="line-clamp-2 max-w-[42ch] text-base text-[#3a5145] max-sm:hidden">
            {product.description}
          </p>
        )}
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-display text-2xl font-bold tracking-[-0.02em] sm:text-[28px]">
            {formatCurrency(product.price)}
          </span>
          {product.stock > 0 ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-accent">
              <span className="h-2 w-2 rounded-full bg-leaf" />
              {product.stock} en stock
            </span>
          ) : (
            <span className="text-sm font-medium text-muted">Agotado</span>
          )}
        </div>
        <div className="mt-1 grid grid-cols-[1fr_auto] gap-2 sm:flex sm:flex-wrap">
          <QuickAddButton product={product} />
          <Link
            href={`/productos/${product.slug}`}
            className="flex h-12 items-center rounded-[11px] border border-ink px-4 text-[15px] font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Ver ficha
          </Link>
        </div>
      </div>
      <Link
        href={`/productos/${product.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="h-44 w-full flex-none overflow-hidden rounded-2xl bg-card shadow-[0_16px_32px_rgba(15,42,29,0.1)] sm:aspect-square sm:h-auto sm:w-[200px] sm:rounded-[20px] sm:shadow-[0_24px_48px_rgba(15,42,29,0.12)] lg:w-[240px]"
      >
        {product.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt="" className="h-full w-full object-contain" />
        )}
      </Link>
    </div>
  );
}

/** Añadir 1 unidad desde el hero. Respeta stock y que un admin no puede comprar. */
function QuickAddButton({ product }: { product: HeroProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const { isAdmin } = useViewer();
  const [added, setAdded] = useState(false);
  const disabled = isAdmin || product.stock <= 0;

  return (
    <button
      type="button"
      disabled={disabled}
      title={isAdmin ? "Las cuentas de administrador no pueden comprar." : undefined}
      onClick={() => {
        addItem({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }}
      className="h-12 rounded-[11px] bg-accent px-5 text-[15px] font-semibold text-white transition-colors hover:bg-accent-ink disabled:bg-line-strong disabled:text-muted"
    >
      {product.stock <= 0 ? "Agotado" : added ? "Añadido ✓" : "Añadir al carrito"}
    </button>
  );
}

function SideCard({ product, dark }: { product: HeroProduct; dark: boolean }) {
  return (
    <Link
      href={`/productos/${product.slug}`}
      className={`group flex flex-col-reverse gap-3 rounded-2xl p-3 transition-shadow sm:flex-row sm:items-center sm:gap-5 sm:rounded-[20px] sm:p-5 md:p-6 ${
        dark
          ? "bg-forest text-line hover:shadow-[0_18px_40px_rgba(11,31,22,0.25)]"
          : "border border-line bg-card text-ink hover:border-line-strong hover:shadow-[0_18px_40px_rgba(11,31,22,0.08)]"
      }`}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-2">
        {product.category && (
          <span className={`eyebrow text-[11px] sm:text-xs ${dark ? "text-lime" : "text-accent"}`}>
            {product.category}
          </span>
        )}
        <span
          className={`line-clamp-2 font-display text-[15px] font-bold leading-tight sm:text-xl ${dark ? "text-white" : ""}`}
        >
          {product.name}
        </span>
        {product.description && (
          <span className={`line-clamp-2 text-sm max-sm:hidden ${dark ? "text-sage" : "text-muted"}`}>
            {product.description}
          </span>
        )}
        <span className={`mt-0.5 font-display text-base font-bold sm:text-xl ${dark ? "text-white" : ""}`}>
          {formatCurrency(product.price)}
        </span>
      </span>
      <span
        className={`aspect-[4/3] w-full flex-none overflow-hidden rounded-xl sm:aspect-auto sm:h-24 sm:w-24 sm:rounded-2xl md:h-28 md:w-28 ${
          dark ? "bg-card" : "bg-surface"
        }`}
      >
        {product.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt="" className="h-full w-full object-contain" />
        )}
      </span>
    </Link>
  );
}

/** Barra secundaria del asistente: al enviar abre el panel con la pregunta. */
function AssistantBar() {
  const send = useChatStore((s) => s.send);
  const pending = useChatStore((s) => s.pending);
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim() || pending) return;
        send(value, { openPanel: true });
        setValue("");
      }}
      className="flex flex-wrap items-center gap-x-3 gap-y-3 rounded-2xl border border-line bg-card p-3 sm:gap-x-5 sm:py-3.5 sm:pl-5 sm:pr-3.5"
    >
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-forest text-lime">
        <ChatIcon size={18} strokeWidth={2} />
      </span>
      <label htmlFor="hero-ask" className="flex flex-none flex-col">
        <span className="font-display text-base font-semibold">¿No sabes cuál elegir?</span>
        <span className="text-[13px] text-muted max-sm:hidden">
          Cuéntale al asistente para qué lo necesitas
        </span>
      </label>
      <div className="flex min-w-0 flex-[1_1_320px] items-center gap-2 rounded-xl bg-surface py-1 pl-3.5 pr-1 focus-within:ring-[3px] focus-within:ring-mint">
        <input
          id="hero-ask"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          placeholder="Ej.: Un mouse para trabajar muchas horas"
          className="h-10 min-w-0 flex-1 text-ellipsis bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={pending || !value.trim()}
          className="h-10 flex-none rounded-[9px] bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-forest disabled:opacity-50"
        >
          Preguntar
        </button>
      </div>
    </form>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}
