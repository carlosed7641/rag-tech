import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";

/**
 * Layout de /login y /registro: sin header/footer de la tienda. Formulario
 * a la izquierda con el logo; en pantallas grandes, panel de marca verde
 * bosque a la derecha (mismo lenguaje visual que el asistente).
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <div className="flex flex-1 flex-col px-4 py-6 md:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-12">{children}</div>
      </div>

      <aside
        aria-hidden="true"
        className="relative hidden w-[44%] max-w-[640px] flex-col justify-between overflow-hidden bg-forest p-12 text-line lg:flex"
      >
        <span className="eyebrow flex items-center gap-2.5 text-lime">
          <span className="h-2 w-2 rounded-full bg-lime" />
          Asistente de compras
        </span>
        <div className="flex flex-col gap-4">
          <div className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-leaf px-4 py-3 text-[15px] text-white">
            ¿Cómo va mi último pedido?
          </div>
          <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-white/[0.06] px-4 py-3 text-[15px]">
            Con tu sesión iniciada puedo revisar el estado de tus órdenes —
            solo las tuyas— y recomendarte productos del catálogo.
          </div>
        </div>
        <p className="font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-white">
          Tecnología con hoja de especificaciones.
        </p>
      </aside>
    </div>
  );
}
