import { createAdminClient } from "@/lib/supabase/admin";
import type { ProductCard } from "@/lib/chat/tools";

/**
 * Lectura de conversaciones del asistente para el panel admin.
 *
 * Usa el cliente con secret key (salta RLS) porque las sesiones anónimas no
 * tienen dueño que pase una política por usuario. Por eso SOLO debe llamarse
 * desde páginas que ya ejecutaron `requireAdmin()`.
 */

export type TranscriptMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  products: ProductCard[];
  createdAt: string;
};

type StoredContent = { text?: unknown; products?: unknown };

function parseContent(content: unknown): { text: string; products: ProductCard[] } {
  const c = (content ?? {}) as StoredContent;
  return {
    text: typeof c.text === "string" ? c.text : "",
    products: Array.isArray(c.products) ? (c.products as ProductCard[]) : [],
  };
}

async function namesFor(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, string>();
  const db = createAdminClient();
  const { data } = await db.from("profiles").select("id, full_name").in("id", userIds);
  return new Map((data ?? []).map((p) => [p.id, p.full_name ?? "Cliente sin nombre"]));
}

export async function listChatSessions(limit = 100) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("chat_sessions")
    .select("id, user_id, created_at, chat_messages(role, content, created_at)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  const names = await namesFor(
    [...new Set(data.map((s) => s.user_id).filter((id): id is string => Boolean(id)))],
  );

  return data
    .map((s) => {
      const msgs = [...s.chat_messages].sort((a, b) => a.created_at.localeCompare(b.created_at));
      const firstUser = msgs.find((m) => m.role === "user");
      return {
        id: s.id,
        createdAt: s.created_at,
        lastActivity: msgs.at(-1)?.created_at ?? s.created_at,
        userName: s.user_id ? (names.get(s.user_id) ?? "Cliente") : null,
        messageCount: msgs.length,
        answered: msgs.some((m) => m.role === "assistant"),
        preview: firstUser ? parseContent(firstUser.content).text : "",
      };
    })
    // Solo conversaciones donde el asistente llegó a responder.
    .filter((s) => s.answered);
}

export async function getChatSession(id: string) {
  const db = createAdminClient();
  const { data: session } = await db
    .from("chat_sessions")
    .select("id, user_id, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!session) return null;

  const { data: rows, error } = await db
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("session_id", id)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const names = await namesFor(session.user_id ? [session.user_id] : []);

  const messages: TranscriptMessage[] = rows.map((r) => ({
    id: r.id,
    role: r.role === "user" ? "user" : "assistant",
    ...parseContent(r.content),
    createdAt: r.created_at,
  }));

  return {
    id: session.id,
    createdAt: session.created_at,
    userName: session.user_id ? (names.get(session.user_id) ?? "Cliente") : null,
    messages,
  };
}
