"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useChatStore } from "@/store/chat";

/** Mensaje único para todos los puntos de compra deshabilitados. */
export const ADMIN_CANNOT_BUY =
  "Las cuentas de administrador no pueden comprar. Usa una cuenta de cliente.";

const ViewerContext = createContext({ isAdmin: false });

/**
 * Expone a los componentes de cliente de la tienda si quien navega es admin.
 * También restaura la conversación del asistente guardada en el navegador y
 * la descarta si pertenece a otro usuario (o a un visitante anónimo distinto
 * de quien ahora tiene sesión).
 */
export function ViewerProvider({
  isAdmin,
  userId,
  children,
}: {
  isAdmin: boolean;
  userId: string | null;
  children: ReactNode;
}) {
  useEffect(() => {
    let cancelled = false;
    Promise.resolve(useChatStore.persist.rehydrate()).then(() => {
      if (cancelled) return;
      const chat = useChatStore.getState();
      chat.syncOwner(userId);
      // Con sesión y sin conversación en el navegador: retoma la última
      // guardada en la DB (p. ej. iniciada en otro dispositivo o antes de
      // que existiera la persistencia local). `ready` se marca al final, para
      // que el hero no muestre el ejemplo mientras tanto.
      if (userId) {
        chat.loadLatest().finally(() => {
          if (!cancelled) useChatStore.getState().markReady();
        });
      } else {
        chat.markReady();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return <ViewerContext.Provider value={{ isAdmin }}>{children}</ViewerContext.Provider>;
}

export function useViewer() {
  return useContext(ViewerContext);
}
