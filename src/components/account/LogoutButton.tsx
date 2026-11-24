"use client";

import { createClient } from "@/lib/supabase/client";
import { useChatStore } from "@/store/chat";

export function LogoutButton({
  className = "rounded-xl border border-line-strong px-4 py-2 text-sm font-medium text-ink hover:border-accent hover:text-accent",
}: {
  className?: string;
}) {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // La conversación del asistente puede incluir datos de pedidos: no debe
    // quedar en el navegador después de cerrar sesión.
    useChatStore.getState().clear();
    // Recarga completa (no router.push): evita que quede una versión en
    // caché de una página protegida como si el usuario siguiera autenticado.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intencional
    window.location.assign("/");
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      Cerrar sesión
    </button>
  );
}
