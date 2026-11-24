import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getChatSession } from "@/lib/chat/transcripts";
import { formatCurrency } from "@/lib/format";
import { BackLink } from "@/components/ui/BackLink";
import { ChatMarkdown } from "@/components/chat/ChatMarkdown";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Explícito aunque el layout ya lo exige: esta página lee con la secret key.
  await requireAdmin();
  const { id } = await params;
  const session = await getChatSession(id);
  if (!session) notFound();

  return (
    <div className="max-w-2xl">
      <BackLink href="/admin/conversaciones">Volver a conversaciones</BackLink>
      <h1 className="mb-1 text-3xl font-bold tracking-[-0.03em] text-ink">Conversación</h1>
      <p className="mb-8 text-sm text-muted">
        {session.userName ?? "Visitante anónimo"} · {formatTime(session.createdAt)} ·{" "}
        {session.messages.length} mensajes
      </p>

      <ol className="flex flex-col gap-4">
        {session.messages.map((m) => (
          <li
            key={m.id}
            className={`flex max-w-[90%] flex-col gap-2 ${m.role === "user" ? "self-end items-end" : "self-start"}`}
          >
            <span className="eyebrow text-[11px] text-muted">
              {m.role === "user" ? "Cliente" : "Asistente"} · {formatTime(m.createdAt)}
            </span>
            {m.text &&
              (m.role === "user" ? (
                <p className="whitespace-pre-wrap rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 text-[15px] text-white">
                  {m.text}
                </p>
              ) : (
                <div className="rounded-2xl rounded-bl-sm border border-line bg-card px-4 py-2.5 text-[15px] text-ink">
                  <ChatMarkdown text={m.text} tone="light" />
                </div>
              ))}
            {m.products.length > 0 && (
              <ul className="flex flex-col gap-1.5 rounded-xl border border-dashed border-line-strong bg-surface p-3 text-sm">
                <li className="eyebrow text-[11px] text-muted">Productos mostrados</li>
                {m.products.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3">
                    <Link href={`/productos/${p.slug}`} className="text-ink hover:text-accent">
                      {p.name}
                    </Link>
                    <span className="tabular-nums text-muted">{formatCurrency(p.price)}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
