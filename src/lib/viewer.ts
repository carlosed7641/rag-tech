import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Quién está navegando (para la tienda): sesión + si es admin. Envuelto en
 * `cache` para que layout, header y páginas compartan una sola consulta por
 * request.
 *
 * Solo sirve para decidir qué mostrar (ocultar/deshabilitar compras). La
 * regla "un admin no puede comprar" la hace cumplir la base de datos (trigger
 * en `orders`, ver supabase/migrations) y /admin sigue protegido por
 * `requireAdmin()`.
 */
export const getViewer = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, isAdmin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { user, isAdmin: profile?.role === "admin" };
});
