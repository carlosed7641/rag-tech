import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProductCard } from "@/lib/chat/tools";

/**
 * Historial del asistente para el usuario con sesión.
 *
 *   GET /api/chat/history            → sus conversaciones (más recientes primero)
 *   GET /api/chat/history?session=ID → mensajes de una conversación suya
 *
 * Usa el cliente con secret key (igual que /api/chat al escribir), pero SIEMPRE
 * filtra por el user_id de la sesión validada en el servidor — nunca por un id
 * que mande el navegador. Una sesión ajena responde 404, igual que una
 * inexistente, para no revelar que existe.
 */

const MAX_SESSIONS = 20;

type StoredContent = { text?: unknown; products?: unknown };

function parseContent(content: unknown) {
  const c = (content ?? {}) as StoredContent;
  return {
    content: typeof c.text === "string" ? c.text : "",
    products: Array.isArray(c.products) ? (c.products as ProductCard[]) : undefined,
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "Inicia sesión para ver tu historial." }, 401);

  const db = createAdminClient();
  const sessionId = new URL(req.url).searchParams.get("session");

  if (sessionId) {
    const { data: session } = await db
      .from("chat_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!session) return json({ error: "Conversación no encontrada." }, 404);

    const { data: rows, error } = await db
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true });
    if (error) return json({ error: "No se pudo cargar la conversación." }, 500);

    const messages = rows
      .map((r) => ({ role: r.role === "user" ? "user" : "assistant", ...parseContent(r.content) }))
      .filter((m) => m.content || (m.products && m.products.length > 0));

    return json({ sessionId: session.id, messages });
  }

  const { data, error } = await db
    .from("chat_sessions")
    .select("id, created_at, chat_messages(role, content, created_at)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(MAX_SESSIONS);
  if (error) return json({ error: "No se pudo cargar el historial." }, 500);

  const sessions = data
    // Solo conversaciones con al menos una respuesta del asistente (las que
    // fallaron antes de responder no le sirven al cliente).
    .filter((s) => s.chat_messages.some((m) => m.role === "assistant"))
    .map((s) => {
      const msgs = [...s.chat_messages].sort((a, b) => a.created_at.localeCompare(b.created_at));
      const firstUser = msgs.find((m) => m.role === "user");
      return {
        id: s.id,
        lastActivity: msgs.at(-1)?.created_at ?? s.created_at,
        preview: firstUser ? parseContent(firstUser.content).content : "",
        messageCount: msgs.length,
      };
    });

  return json({ sessions });
}
