"use client";

import { useEffect, useState } from "react";
import { useChatStore } from "@/store/chat";

type SessionSummary = {
  id: string;
  lastActivity: string;
  preview: string;
  messageCount: number;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Lista de conversaciones anteriores del usuario (dentro del panel del
 * asistente). Al elegir una se carga desde la DB y se puede continuar.
 */
export function ChatHistory({ onDone }: { onDone: () => void }) {
  const loadSession = useChatStore((s) => s.loadSession);
  const currentId = useChatStore((s) => s.sessionId);
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [error, setError] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/chat/history")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { sessions: SessionSummary[] }) => !ignore && setSessions(d.sessions))
      .catch(() => !ignore && setError(true));
    return () => {
      ignore = true;
    };
  }, []);

  async function open(id: string) {
    setLoadingId(id);
    const ok = await loadSession(id);
    setLoadingId(null);
    if (ok) onDone();
    else setError(true);
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5">
      <h2 className="eyebrow text-muted">Conversaciones anteriores</h2>

      {error && (
        <p className="text-sm text-danger">No se pudo cargar el historial. Intenta de nuevo.</p>
      )}
      {!error && sessions === null && (
        <p className="text-sm text-muted" role="status">
          Cargando…
        </p>
      )}
      {sessions?.length === 0 && (
        <p className="text-sm text-muted">Todavía no tienes conversaciones guardadas.</p>
      )}

      <ul className="flex flex-col gap-2">
        {sessions?.map((s) => {
          const current = s.id === currentId;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => open(s.id)}
                disabled={loadingId !== null}
                aria-current={current}
                className={`flex w-full flex-col gap-1 rounded-xl border px-3.5 py-3 text-left transition-colors disabled:opacity-60 ${
                  current
                    ? "border-accent bg-mint-soft"
                    : "border-line bg-card hover:border-line-strong"
                }`}
              >
                <span className="line-clamp-2 text-sm font-medium text-ink">
                  {s.preview || "(sin texto)"}
                </span>
                <span className="text-xs text-muted">
                  {loadingId === s.id
                    ? "Abriendo…"
                    : `${formatDate(s.lastActivity)} · ${s.messageCount} mensajes${current ? " · actual" : ""}`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
