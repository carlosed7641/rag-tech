"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { useChatStore } from "@/store/chat";
import { ChatComposer, ChatThread } from "@/components/chat/ChatThread";
import { CHAT_SUGGESTIONS } from "@/components/chat/ChatWidget";
import {
  ArrowRightIcon,
  ChatIcon,
  SearchIcon,
} from "@/components/ui/icons";

// Ejemplos cortos para el placeholder: rotan para mostrar distintos usos
// sin que el texto se corte en el input.
const PLACEHOLDERS = [
  "Audífonos para correr, bajo $250.000",
  "Un regalo para un gamer",
  "Bocina resistente al agua",
  "Teclado para programar",
];

/** Producto real mostrado en la conversación de ejemplo. */
export type ExampleProduct = {
  slug: string;
  name: string;
  price: number;
  image: string | null;
};

/**
 * Hero del home: el buscador ES el chat. Al escribir (o tocar una
 * sugerencia) la conversación arranca dentro del panel oscuro de la
 * derecha; mientras no hay mensajes, el panel muestra un ejemplo estático.
 */
export function HomeAssistant({ examples }: { examples: ExampleProduct[] }) {
  const send = useChatStore((s) => s.send);
  const pending = useChatStore((s) => s.pending);
  const live = useChatStore((s) => s.messages.length > 0);
  // Hasta restaurar la conversación guardada no se sabe si hay una: se muestra
  // un esqueleto en vez del ejemplo para no hacer un destello ejemplo → chat.
  const ready = useChatStore((s) => s.ready);
  const [value, setValue] = useState("");
  const [hint, setHint] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) return; // no rotar mientras el usuario escribe
    const id = setInterval(() => setHint((h) => (h + 1) % PLACEHOLDERS.length), 3500);
    return () => clearInterval(id);
  }, [value]);

  function ask(text: string) {
    if (!text.trim() || pending) return;
    send(text);
    revealPanel();
  }

  /**
   * En móvil (columnas apiladas) el chat queda debajo del formulario: tras
   * enviar, cierra el teclado y baja hasta el panel. Se decide midiendo la
   * posición real, no el ancho de pantalla — en escritorio, con el panel al
   * lado, no hace nada.
   */
  function revealPanel() {
    (document.activeElement as HTMLElement | null)?.blur();
    // Doble rAF: espera a que el panel pase a modo conversación (cambia de alto).
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const panel = panelRef.current;
        const form = formRef.current;
        if (!panel || !form) return;
        const stacked =
          panel.getBoundingClientRect().top >= form.getBoundingClientRect().bottom - 1;
        if (!stacked) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        panel.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }),
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || pending) return;
    ask(value);
    setValue("");
  }

  return (
    <section className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-12 px-4 pb-16 pt-12 md:px-6 md:pt-18">
      <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-7">
        <div className="eyebrow flex items-center gap-2.5 text-accent">
          <span className="h-2 w-2 rounded-full bg-leaf shadow-[0_0_0_4px_var(--mint)]" />
          Asistente de compras en línea
        </div>
        <h1 className="text-balance text-[clamp(2.5rem,5.4vw,4.5rem)] font-bold leading-none tracking-[-0.035em]">
          No busques el producto.{" "}
          <span className="text-accent">Describe el problema.</span>
        </h1>
        <p className="max-w-[48ch] text-lg text-muted">
          Cuéntale al asistente para qué lo necesitas y cuánto quieres gastar.
          Busca por significado en las fichas técnicas de todo el catálogo y te
          muestra solo lo que encaja.
        </p>

        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <label htmlFor="hero-ask" className="text-sm font-semibold">
            ¿Qué necesitas?
          </label>
          <div className="flex items-center gap-2 rounded-2xl border-[1.5px] border-ink bg-card py-2 pl-4 pr-2 shadow-[0_10px_30px_rgba(15,42,29,0.08)] focus-within:shadow-[0_0_0_4px_var(--mint)]">
            <SearchIcon size={20} className="flex-none text-muted" />
            <input
              id="hero-ask"
              // Margen para que el header fijo no tape el input al llegar por scroll.
              style={{ scrollMarginTop: "8rem" }}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoComplete="off"
              placeholder={`Ej.: ${PLACEHOLDERS[hint]}`}
              className="h-12 min-w-0 flex-1 text-ellipsis bg-transparent text-base text-ink outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              disabled={pending || !value.trim()}
              className="flex h-12 flex-none items-center gap-2 rounded-[11px] bg-accent px-5 text-[15px] font-semibold text-white transition-colors hover:bg-accent-ink disabled:opacity-60"
            >
              <span className="hidden sm:inline">Preguntar</span>
              <ArrowRightIcon size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {CHAT_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                disabled={pending}
                className="min-h-11 rounded-[10px] border border-line-strong bg-surface px-3.5 text-sm text-ink transition-colors hover:border-accent hover:bg-card"
              >
                {s}
              </button>
            ))}
          </div>
        </form>
      </div>

      <div
        ref={panelRef}
        // Margen para que el header fijo no tape el panel al llegar por scroll.
        style={{ scrollMarginTop: "5.5rem" }}
        className={`flex min-w-0 flex-[1_1_440px] flex-col gap-4 rounded-2xl bg-forest p-6 text-line shadow-[0_30px_60px_rgba(11,31,22,0.22)] ${
          live ? "h-[34rem]" : !ready ? "min-h-[30rem]" : ""
        }`}
      >
        <div className="flex flex-none items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-lime/15 text-lime">
              <ChatIcon size={16} strokeWidth={2} />
            </span>
            <span className="font-display text-base font-semibold">Asistente RagTech</span>
          </div>
        </div>

        {live ? (
          <>
            <ChatThread tone="dark" className="min-h-0 flex-1 pr-1" />
            <ChatComposer tone="dark" placeholder="Sigue preguntando…" />
          </>
        ) : !ready ? (
          <ChatSkeleton />
        ) : (
          <ExampleConversation products={examples} />
        )}
      </div>
    </section>
  );
}

/** Placeholder neutro mientras se restaura la conversación guardada. */
function ChatSkeleton() {
  const block = "motion-safe:animate-pulse rounded-2xl bg-white/[0.06]";
  return (
    <div className="flex flex-1 flex-col gap-4" role="status" aria-label="Cargando conversación">
      <div className={`h-12 w-3/5 self-end rounded-br-sm ${block}`} />
      <div className={`h-20 w-4/5 rounded-bl-sm ${block}`} />
      <div className="grid grid-cols-2 gap-2.5">
        <div className={`h-36 ${block}`} />
        <div className={`h-36 ${block}`} />
      </div>
      <div className={`mt-auto h-14 ${block}`} />
    </div>
  );
}

function ExampleConversation({ products }: { products: ExampleProduct[] }) {
  return (
    <div className="flex flex-col gap-4" aria-label="Ejemplo de conversación">
      <div className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-leaf px-4 py-3 text-[15px] text-white">
        Un mouse inalámbrico para trabajar muchas horas
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-white/[0.06] px-4 py-3 text-[15px]">
        Para jornadas largas te recomiendo el mouse plateado: es ergonómico y
        silencioso. Si necesitas más precisión, por ejemplo para diseño, el
        mouse rojo es inalámbrico y de alta precisión.
      </div>
      {products.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5">
          {products.map((p) => (
            <ExampleCard key={p.slug} product={p} />
          ))}
        </div>
      )}
      <p className="tabular-nums text-xs text-sage">
        Escribe en «¿Qué necesitas?» para empezar tu propia conversación.
      </p>
    </div>
  );
}

function ExampleCard({ product }: { product: ExampleProduct }) {
  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex min-w-0 flex-col gap-2 rounded-xl bg-bg p-2.5 text-ink transition-shadow hover:shadow-[0_0_0_2px_var(--lime)]"
    >
      <div className="aspect-[4/3] overflow-hidden rounded-[9px] bg-line">
        {product.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain"
          />
        )}
      </div>
      <p className="truncate text-sm font-semibold">{product.name}</p>
      <p className="tabular-nums text-[13px]">{formatCurrency(product.price)}</p>
    </Link>
  );
}

/**
 * CTA "Probar el asistente" de la sección "Cómo funciona": sube al hero con
 * scroll suave, deja el input centrado (el header fijo no lo tapa) y lo
 * enfoca para escribir de inmediato.
 */
export function TryAssistantButton() {
  function goToHero() {
    const input = document.getElementById("hero-ask") as HTMLInputElement | null;
    if (!input) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    input.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    // preventScroll: el foco no debe interrumpir el scroll suave.
    input.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      onClick={goToHero}
      className="flex min-h-12 items-center gap-2 rounded-[11px] bg-lime px-5 text-[15px] font-semibold text-ink transition-transform hover:-translate-y-0.5"
    >
      Probar el asistente
      <ArrowRightIcon size={16} />
    </button>
  );
}
