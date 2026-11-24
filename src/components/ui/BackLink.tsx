import Link from "next/link";

/** Enlace "← Volver a …" sobre el título de una página. */
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent"
    >
      <span aria-hidden="true">←</span> {children}
    </Link>
  );
}
