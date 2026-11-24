"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { useChatStore, type ChatMessage } from "@/store/chat";
import { ArrowUpIcon } from "@/components/ui/icons";
import { ChatMarkdown } from "@/components/chat/ChatMarkdown";

type Tone = "light" | "dark";

/**
 * Hilo de mensajes del asistente. `tone="dark"` es la variante del panel
 * verde bosque (hero del home); `light` la del drawer.
 */
export function ChatThread({
  tone,
  className = "",
}: {
  tone: Tone;
  className?: string;
}) {
  const messages = useChatStore((s) => s.messages);
  const pending = useChatStore((s) => s.pending);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      aria-live="polite"
      className={`flex flex-col gap-4 overflow-y-auto ${tone === "dark" ? "scroll-dark" : ""} ${className}`}
    >
      {messages.map((m, i) => (
        <Bubble
          key={i}
          message={m}
          tone={tone}
          typing={pending && i === messages.length - 1 && !m.content}
        />
      ))}
    </div>
  );
}

function Bubble({
  message,
  tone,
  typing,
}: {
  message: ChatMessage;
  tone: Tone;
  typing: boolean;
}) {
  const dark = tone === "dark";

  if (message.role === "user") {
    return (
      <div
        className={`max-w-[85%] self-end rounded-2xl rounded-br-sm px-4 py-2.5 text-[15px] ${
          dark ? "bg-leaf text-white" : "bg-ink text-white"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    );
  }

  return (
    <div className="flex max-w-[94%] flex-col gap-3 self-start">
      {(message.content || typing) && (
        <div
          className={`rounded-2xl rounded-bl-sm px-4 py-2.5 text-[15px] ${
            dark ? "bg-white/[0.06] text-line" : "border border-line bg-card text-ink"
          }`}
        >
          {message.content ? (
            <ChatMarkdown text={message.content} tone={tone} />
          ) : (
            <TypingDots dark={dark} />
          )}
        </div>
      )}

      {message.products && message.products.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5">
          {message.products.map((p) => (
            <Link
              key={p.id}
              href={`/productos/${p.slug}`}
              className="group flex min-w-0 flex-col gap-2 rounded-xl border border-line bg-card p-2.5 text-ink transition-colors hover:border-accent"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-lg bg-surface">
                {p.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
              <p className="line-clamp-2 text-sm font-semibold leading-snug">{p.name}</p>
              <p className="mt-auto flex items-baseline gap-2 tabular-nums text-[13px]">
                <span>{formatCurrency(p.price)}</span>
                {p.compareAtPrice && (
                  <span className="text-muted line-through">
                    {formatCurrency(p.compareAtPrice)}
                  </span>
                )}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function TypingDots({ dark }: { dark: boolean }) {
  const dot = `h-1.5 w-1.5 animate-bounce rounded-full ${dark ? "bg-sage" : "bg-muted"}`;
  return (
    <span className="flex items-center gap-1 py-1.5" aria-label="El asistente está escribiendo">
      <span className={`${dot} [animation-delay:-0.3s]`} />
      <span className={`${dot} [animation-delay:-0.15s]`} />
      <span className={dot} />
    </span>
  );
}

/** Campo de texto del asistente, compartido por hero y drawer. */
export function ChatComposer({
  tone,
  placeholder = "Escribe lo que necesitas…",
  autoFocus,
}: {
  tone: Tone;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const send = useChatStore((s) => s.send);
  const pending = useChatStore((s) => s.pending);
  const [value, setValue] = useState("");
  const dark = tone === "dark";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || pending) return;
    send(value);
    setValue("");
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`flex items-center gap-2 rounded-xl p-1.5 pl-4 ${
        dark
          ? "border border-white/10 bg-white/[0.05] focus-within:border-lime/60"
          : "border-[1.5px] border-ink bg-card focus-within:shadow-[0_0_0_3px_var(--mint)]"
      }`}
    >
      <label htmlFor={`chat-input-${tone}`} className="sr-only">
        Mensaje para el asistente
      </label>
      <input
        id={`chat-input-${tone}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        className={`h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none ${
          dark ? "text-white placeholder:text-sage" : "text-ink placeholder:text-muted"
        }`}
      />
      <button
        type="submit"
        disabled={pending || !value.trim()}
        aria-label="Enviar mensaje"
        className={`flex h-11 w-11 flex-none items-center justify-center rounded-[10px] transition-opacity disabled:opacity-40 ${
          dark ? "bg-lime text-ink" : "bg-accent text-white hover:bg-accent-ink"
        }`}
      >
        <ArrowUpIcon size={16} />
      </button>
    </form>
  );
}
