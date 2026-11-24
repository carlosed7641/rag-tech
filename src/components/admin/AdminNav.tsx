"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { LogoutButton } from "@/components/account/LogoutButton";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/ordenes", label: "Órdenes" },
  { href: "/admin/conversaciones", label: "Conversaciones" },
  { href: "/admin/cupones", label: "Cupones" },
  { href: "/admin/usuarios", label: "Usuarios" },
];

export function AdminNav({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    // md+: sidebar fija (sticky) que no se mueve ni cambia de tamaño al
    // cambiar de tab — self-start evita que el flex la estire a la altura
    // del contenido. En mobile es una barra compacta arriba, con los links
    // en una fila con scroll horizontal (nunca se aprietan ni desbordan la
    // pantalla).
    <aside className="w-full flex-none md:sticky md:top-10 md:w-48 md:self-start">
      <div className="mb-3 flex items-center justify-between md:mb-6 md:block">
        <div className="min-w-0">
          <Logo href="/admin" suffix="admin" className="mb-4 hidden md:flex" />
          <p className="eyebrow text-muted">Panel admin</p>
          <p className="truncate text-sm font-semibold text-ink">{adminName}</p>
        </div>
        <div className="flex flex-none items-center gap-2 md:hidden">
          <Link
            href="/"
            className="rounded-[10px] px-2.5 py-2 text-xs font-medium text-muted hover:text-ink"
          >
            ← Tienda
          </Link>
          <LogoutButton className="rounded-[10px] border border-line-strong px-3 py-2 text-xs font-medium text-ink hover:border-danger hover:text-danger" />
        </div>
      </div>

      <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 text-sm md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "flex-none rounded-[11px] bg-forest px-4 py-2.5 font-semibold whitespace-nowrap text-white"
                  : "flex-none rounded-[11px] px-4 py-2.5 font-medium whitespace-nowrap text-muted hover:bg-mint-soft hover:text-ink"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 hidden flex-col items-start gap-3 border-t border-line pt-5 md:flex">
        <Link href="/" className="text-sm font-medium text-muted hover:text-ink">
          ← Volver a la tienda
        </Link>
        <LogoutButton className="w-full rounded-[11px] border border-line-strong px-4 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:border-danger hover:text-danger" />
      </div>
    </aside>
  );
}
