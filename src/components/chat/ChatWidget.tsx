"use client";

import { useEffect, useState } from "react";
import { useChatStore } from "@/store/chat";
import { ChatComposer, ChatThread } from "@/components/chat/ChatThread";
import { ChatIcon, CloseIcon, HistoryIcon, NewChatIcon } from "@/components/ui/icons";
import { ChatHistory } from "@/components/chat/ChatHistory";

export const CHAT_SUGGESTIONS = [
  "Regalo gamer bajo $300.000",
  "Armar mi setup de streaming",
  "¿Dónde está mi pedido?",
];

/**
 * Panel lateral del asistente, disponible en todas las rutas de la tienda
 * (vive en el layout de `(shop)`). Se abre desde el botón "Asistente" del
 * header, el botón flotante o "Pregúntale a la ficha". La conversación es
 * la misma que la del hero del home (ver `store/chat.ts`).
 */
export function ChatWidget() {
  const open = useChatStore((s) => s.open);
  const setOpen = useChatStore((s) => s.setOpen);
  const reset = useChatStore((s) => s.reset);
  const send = useChatStore((s) => s.send);
  const pending = useChatStore((s) => s.pending);
  const empty = useChatStore((s) => s.messages.length === 0);
  // Con sesión iniciada hay historial guardado en la DB.
  const loggedIn = useChatStore((s) => s.ownerId !== null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2.5 rounded-2xl bg-forest pl-4 pr-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(11,31,22,0.28)] transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-lime/15 text-lime">
            <ChatIcon size={16} strokeWidth={2} />
          </span>
          Asistente
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Cerrar asistente"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-ink/30 backdrop-blur-[2px]"
            tabIndex={-1}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Asistente RagTech"
            className="relative flex h-full w-full flex-col bg-bg shadow-2xl sm:w-[26rem] lg:w-[30rem] sm:border-l sm:border-line"
          >
            <header className="flex flex-none items-center gap-3 bg-forest px-4 py-4 text-line">
              <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-lime/15 text-lime">
                <ChatIcon size={18} strokeWidth={2} />
              </span>
              <div className="flex flex-1 flex-col">
                <span className="font-display text-[17px] font-semibold text-white">
                  Asistente RagTech
                </span>
                <span className="flex items-center gap-1.5 tabular-nums text-xs text-sage">
                  <span className="h-[7px] w-[7px] rounded-full bg-lime" />
                  Productos y pedidos
                </span>
              </div>
              {loggedIn && (
                <button
                  type="button"
                  onClick={() => setShowHistory((v) => !v)}
                  disabled={pending}
                  aria-pressed={showHistory}
                  aria-label="Conversaciones anteriores"
                  title="Conversaciones anteriores"
                  className={`flex h-11 w-11 items-center justify-center rounded-[11px] text-line hover:bg-white/10 disabled:opacity-40 ${
                    showHistory ? "bg-lime/20 text-lime" : "bg-white/[0.06]"
                  }`}
                >
                  <HistoryIcon />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  reset();
                  setShowHistory(false);
                }}
                disabled={pending || empty}
                aria-label="Nueva conversación"
                className="flex h-11 w-11 items-center justify-center rounded-[11px] bg-white/[0.06] text-line hover:bg-white/10 disabled:opacity-40"
              >
                <NewChatIcon />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar asistente"
                className="flex h-11 w-11 items-center justify-center rounded-[11px] bg-white/[0.06] text-line hover:bg-white/10"
              >
                <CloseIcon />
              </button>
            </header>

            {showHistory ? (
              <ChatHistory onDone={() => setShowHistory(false)} />
            ) : empty ? (
              <div className="flex flex-1 flex-col justify-end gap-4 overflow-y-auto px-4 py-5">
                <div className="rounded-2xl rounded-bl-sm border border-line bg-card px-4 py-3 text-[15px]">
                  ¡Hola! Cuéntame qué necesitas —para qué lo vas a usar y cuánto
                  quieres gastar— y busco en las fichas de todo el catálogo. También
                  puedo revisar el estado de tus pedidos si iniciaste sesión.
                </div>
              </div>
            ) : (
              <ChatThread tone="light" className="flex-1 px-4 py-5" />
            )}

            <div
              className={`flex-none flex-col gap-2.5 border-t border-line px-4 pb-5 pt-3 ${
                showHistory ? "hidden" : "flex"
              }`}
            >
              {empty && (
                <div className="flex gap-2 overflow-x-auto">
                  {CHAT_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="min-h-10 flex-none rounded-[10px] border border-line-strong bg-card px-3 text-[13.5px] text-ink hover:border-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <ChatComposer tone="light" autoFocus />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

/** Botón que abre el drawer — para el header (server component). */
export function AssistantButton({ className = "" }: { className?: string }) {
  const setOpen = useChatStore((s) => s.setOpen);
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`flex h-11 items-center gap-2 rounded-[11px] border border-line-strong bg-card px-4 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent ${className}`}
    >
      <ChatIcon />
      Asistente
    </button>
  );
}
