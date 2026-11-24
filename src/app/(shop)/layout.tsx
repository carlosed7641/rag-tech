import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ViewerProvider } from "@/components/layout/ViewerContext";
import { getViewer } from "@/lib/viewer";

/**
 * Layout del grupo de rutas de la tienda pública: header (con buscador) y
 * footer. /login, /registro y /admin quedan fuera de este grupo a propósito
 * — no deben mostrar el header/buscador de la tienda. El widget de chat
 * (Fase 4) vive acá porque es de cara al cliente, no al admin.
 *
 * Un admin puede navegar la tienda pero no comprar: `isAdmin` llega a los
 * componentes de cliente vía ViewerProvider para deshabilitar las compras.
 */
export default async function ShopLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin } = await getViewer();

  return (
    <ViewerProvider isAdmin={isAdmin} userId={user?.id ?? null}>
      <Header isAdmin={isAdmin} />
      <main className="flex-1">{children}</main>
      <Footer isAdmin={isAdmin} />
      <ChatWidget />
    </ViewerProvider>
  );
}
