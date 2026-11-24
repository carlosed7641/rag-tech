import Link from "next/link";
import { SearchBar } from "@/components/search/SearchBar";
import { CartBadge } from "@/components/layout/CartBadge";
import { AssistantButton } from "@/components/chat/ChatWidget";
import { CartIcon, UserIcon } from "@/components/ui/icons";
import { Logo } from "@/components/layout/Logo";

export function Header({ isAdmin }: { isAdmin: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3.5 md:flex-nowrap md:px-6">
        <Logo className="order-1" />

        <nav
          aria-label="Principal"
          className="order-5 flex w-full basis-full gap-6 text-[15px] font-medium text-muted md:order-2 md:w-auto md:basis-auto"
        >
          <Link href="/productos" className="hover:text-ink">
            Catálogo
          </Link>
          {/* Un admin no tiene pedidos propios (no puede comprar). */}
          {!isAdmin && (
            <Link href="/cuenta" className="hover:text-ink">
              Mis pedidos
            </Link>
          )}
        </nav>

        <div className="order-4 w-full basis-full md:order-3 md:w-auto md:flex-1 md:basis-auto">
          <SearchBar />
        </div>

        <div className="order-2 ml-auto flex items-center gap-2 md:order-4 md:ml-0">
          <AssistantButton className="hidden sm:flex" />
          {isAdmin ? (
            // Admin: acceso al panel en lugar de cuenta/carrito (no puede comprar).
            <Link
              href="/admin"
              className="flex h-11 items-center gap-2.5 whitespace-nowrap rounded-[11px] bg-forest px-4 text-sm font-semibold text-white transition-colors hover:bg-ink"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="text-lime"
              >
                <rect x="3" y="3" width="7" height="9" rx="1.5" />
                <rect x="14" y="3" width="7" height="5" rx="1.5" />
                <rect x="14" y="12" width="7" height="9" rx="1.5" />
                <rect x="3" y="16" width="7" height="5" rx="1.5" />
              </svg>
              Panel admin
            </Link>
          ) : (
            <>
              <Link
                href="/cuenta"
                aria-label="Mi cuenta"
                className="flex h-11 w-11 items-center justify-center rounded-[11px] border border-line-strong bg-card text-ink transition-colors hover:border-accent hover:text-accent"
              >
                <UserIcon />
              </Link>
              <Link
                href="/carrito"
                className="flex h-11 items-center gap-2.5 whitespace-nowrap rounded-[11px] bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-forest"
              >
                <CartIcon />
                <span className="hidden sm:inline">Carrito</span>
                <span className="rounded-md bg-lime px-1.5 py-px tabular-nums text-xs text-ink">
                  <CartBadge />
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
