import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export function Footer({ isAdmin }: { isAdmin: boolean }) {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-10 px-4 pb-10 pt-14 md:px-6">
        <div className="flex flex-wrap justify-between gap-8">
          <div className="flex max-w-xs flex-col gap-2.5">
            <Logo />
            <span className="text-[15px] text-muted">
              Tecnología con hoja de especificaciones. Envíos a toda Colombia.
            </span>
          </div>
          <nav
            aria-label="Pie de página"
            className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-[15px] sm:grid-cols-[repeat(2,minmax(140px,auto))]"
          >
            <span className="eyebrow text-muted">Tienda</span>
            <span className="eyebrow text-muted">Cuenta</span>
            <Link href="/productos" className="hover:text-accent">
              Catálogo
            </Link>
            {isAdmin ? (
              // Un admin no compra: su "cuenta" es el panel.
              <Link href="/admin" className="hover:text-accent">
                Panel admin
              </Link>
            ) : (
              <>
                <Link href="/cuenta" className="hover:text-accent">
                  Mis pedidos
                </Link>
                <Link href="/carrito" className="hover:text-accent">
                  Carrito
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-line-strong pt-5 tabular-nums text-xs text-muted">
          <span>© 2026 RagTech</span>
        </div>
      </div>
    </footer>
  );
}
