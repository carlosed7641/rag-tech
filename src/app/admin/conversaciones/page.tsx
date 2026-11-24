import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { listChatSessions } from "@/lib/chat/transcripts";

const LIMIT = 100;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminConversationsPage() {
  // Explícito aunque el layout ya lo exige: esta página lee con la secret key.
  await requireAdmin();
  const sessions = await listChatSessions(LIMIT);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-ink">Conversaciones</h1>
        <span className="text-sm text-muted">
          Últimas {LIMIT} sesiones del asistente
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line bg-surface text-left eyebrow text-muted">
              <th className="px-4 py-3">Primera pregunta</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Mensajes</th>
              <th className="px-4 py-3">Última actividad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sessions.map((s) => (
              <tr key={s.id}>
                <td className="max-w-[320px] px-4 py-3">
                  <Link
                    href={`/admin/conversaciones/${s.id}`}
                    className="line-clamp-2 font-medium text-ink hover:text-accent"
                  >
                    {s.preview || "(sin texto)"}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {s.userName ? (
                    <span className="text-ink">{s.userName}</span>
                  ) : (
                    <span className="text-muted">Anónimo</span>
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums text-ink">{s.messageCount}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {formatDate(s.lastActivity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sessions.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted">
            Todavía no hay conversaciones con el asistente.
          </p>
        )}
      </div>
    </div>
  );
}
