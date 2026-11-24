"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ProductCard } from "@/lib/chat/tools";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  products?: ProductCard[];
};

type ChatState = {
  /** Panel lateral (drawer) abierto. */
  open: boolean;
  messages: ChatMessage[];
  pending: boolean;
  sessionId?: string;
  /** Usuario dueño de la conversación guardada (null = visitante anónimo). */
  ownerId: string | null;
  /** Ya se restauró la conversación (localStorage y, con sesión, la DB). Antes
   *  de esto no se sabe si hay conversación: la UI muestra un estado de carga
   *  en vez del ejemplo, para no hacer un destello ejemplo → conversación. */
  ready: boolean;
  markReady: () => void;
  setOpen: (open: boolean) => void;
  /** Envía un mensaje. Con `openPanel` además abre el drawer (útil desde
   *  entradas que no muestran la conversación, p. ej. la ficha de producto). */
  send: (text: string, opts?: { openPanel?: boolean }) => Promise<void>;
  reset: () => void;
  /** Borra la conversación si quien navega no es su dueño (otro usuario
   *  inició sesión en este navegador). Se llama tras restaurar del storage. */
  syncOwner: (userId: string | null) => void;
  /** Borra todo sin condiciones (al cerrar sesión). */
  clear: () => void;
  /** Carga una conversación guardada del usuario (desde la DB) y la continúa. */
  loadSession: (sessionId: string) => Promise<boolean>;
  /** Si no hay conversación local, carga la más reciente del usuario. */
  loadLatest: () => Promise<void>;
};

/** Cuántos mensajes se guardan en el navegador como máximo. */
const MAX_STORED_MESSAGES = 40;

/**
 * Conversación única del asistente, compartida por todas sus entradas:
 * el hero del home, el botón "Asistente" del header (drawer) y
 * "Pregúntale a la ficha" en el detalle de producto.
 *
 * Se guarda en localStorage para sobrevivir a recargas. `skipHydration`: se
 * restaura en el cliente después de montar (ViewerProvider), así el HTML del
 * servidor y el primer render coinciden. Puede contener datos de pedidos, por
 * eso se borra al cerrar sesión o si cambia el usuario (syncOwner).
 */
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      open: false,
      messages: [],
      pending: false,
      sessionId: undefined,
      ownerId: null,
      ready: false,

      markReady: () => set({ ready: true }),

      setOpen: (open) => set({ open }),

      reset: () => {
        if (get().pending) return;
        set({ messages: [], sessionId: undefined });
      },

      syncOwner: (userId) => {
        if (get().ownerId === userId) return;
        set({ messages: [], sessionId: undefined, ownerId: userId });
      },

      clear: () => set({ messages: [], sessionId: undefined, ownerId: null, open: false }),

      loadSession: async (sessionId) => {
        if (get().pending) return false;
        try {
          const res = await fetch(`/api/chat/history?session=${encodeURIComponent(sessionId)}`);
          if (!res.ok) return false;
          const data: { sessionId: string; messages: ChatMessage[] } = await res.json();
          // Si mientras tanto el usuario empezó a escribir, no pisar su conversación.
          if (get().pending) return false;
          set({ messages: data.messages, sessionId: data.sessionId });
          return true;
        } catch {
          return false;
        }
      },

      loadLatest: async () => {
        if (!get().ownerId || get().messages.length > 0) return;
        try {
          const res = await fetch("/api/chat/history");
          if (!res.ok) return;
          const data: { sessions: { id: string }[] } = await res.json();
          const latest = data.sessions[0];
          // Re-chequeo: el usuario pudo haber escrito mientras llegaba la lista.
          if (latest && get().messages.length === 0) await get().loadSession(latest.id);
        } catch {
          // Sin historial disponible: se queda con el chat vacío.
        }
      },

      send: async (raw, opts) => {
        const text = raw.trim();
        if (!text || get().pending) return;

        const history: ChatMessage[] = [...get().messages, { role: "user", content: text }];
        set({
          messages: [...history, { role: "assistant", content: "" }],
          pending: true,
          ...(opts?.openPanel ? { open: true } : {}),
        });

        // Actualiza el último mensaje (el turno del asistente en curso).
        const patchLast = (fn: (m: ChatMessage) => ChatMessage) =>
          set((s) => {
            const copy = [...s.messages];
            copy[copy.length - 1] = fn(copy[copy.length - 1]);
            return { messages: copy };
          });

        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: history.map((m) => ({ role: m.role, content: m.content })),
              sessionId: get().sessionId,
            }),
          });

          if (!res.body) throw new Error("Sin respuesta del servidor.");
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const events = buffer.split("\n\n");
            buffer = events.pop() ?? "";

            for (const rawEvent of events) {
              const lines = rawEvent.split("\n");
              const eventLine = lines.find((l) => l.startsWith("event: "));
              const dataLine = lines.find((l) => l.startsWith("data: "));
              if (!eventLine || !dataLine) continue;

              const eventName = eventLine.slice("event: ".length);
              const data = JSON.parse(dataLine.slice("data: ".length));

              if (eventName === "text") {
                patchLast((m) => ({ ...m, content: m.content + data.delta }));
              } else if (eventName === "products") {
                patchLast((m) => ({ ...m, products: data.items }));
              } else if (eventName === "done") {
                set((s) => ({ sessionId: data.sessionId ?? s.sessionId }));
              } else if (eventName === "error") {
                patchLast(() => ({ role: "assistant", content: String(data.message) }));
              }
            }
          }
        } catch {
          patchLast(() => ({
            role: "assistant",
            content: "No pude conectarme. Intenta de nuevo en un momento.",
          }));
        } finally {
          set({ pending: false });
        }
      },
    }),
    {
      name: "ragtech-chat",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      // Solo la conversación (no el drawer abierto ni `pending`). Se descartan
      // respuestas vacías (recarga en medio del streaming) y se acota el largo.
      partialize: (s) => ({
        messages: s.messages
          .filter((m) => m.content || (m.products && m.products.length > 0))
          .slice(-MAX_STORED_MESSAGES),
        sessionId: s.sessionId,
        ownerId: s.ownerId,
      }),
    },
  ),
);
