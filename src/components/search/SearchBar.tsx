"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";

type QuickResult = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
};

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QuickResult[]>([]);
  const [open, setOpen] = useState(false);
  // Opción resaltada con teclado/mouse: 0..n-1 = productos, n = "Ver todos",
  // -1 = ninguna (Enter va a la página de resultados).
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const optionId = (i: number) => `${listboxId}-opt-${i}`;

  // Debounce: espera 250ms de silencio antes de consultar la API.
  // Con menos de 2 caracteres simplemente no se dispara el fetch (shownResults
  // ya cae a [] más abajo, sin necesidad de un setState síncrono aquí).
  useEffect(() => {
    if (query.trim().length < 2) return;

    let ignore = false;
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search/quick?q=${encodeURIComponent(query)}`);
      if (ignore || !res.ok) return;
      const data = await res.json();
      if (ignore) return;
      setResults(data.results ?? []);
      setActiveIndex(-1);
      setOpen(true);
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(timeout);
    };
  }, [query]);

  const shownResults = query.trim().length < 2 ? [] : results;

  // Cierra el dropdown al hacer clic fuera.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToResultsPage() {
    if (query.trim().length === 0) return;
    setOpen(false);
    setActiveIndex(-1);
    router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
  }

  function goToProduct(r: QuickResult) {
    setOpen(false);
    setActiveIndex(-1);
    router.push(`/productos/${r.slug}`);
  }

  const listOpen = open && shownResults.length > 0;
  // Productos + la fila "Ver todos los resultados".
  const optionCount = shownResults.length + 1;

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (shownResults.length === 0) return;
      e.preventDefault(); // evita mover el cursor dentro del input
      if (!open) {
        setOpen(true);
        setActiveIndex(e.key === "ArrowDown" ? 0 : optionCount - 1);
        return;
      }
      setActiveIndex((i) =>
        e.key === "ArrowDown"
          ? (i + 1) % optionCount
          : (i - 1 + optionCount) % optionCount,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (listOpen && activeIndex >= 0 && activeIndex < shownResults.length) {
        goToProduct(shownResults[activeIndex]);
      } else {
        goToResultsPage();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full md:max-w-[26rem]">
      <label className="flex h-11 items-center gap-2.5 rounded-[11px] border border-line-strong bg-card px-3.5 transition-[border-color,box-shadow] focus-within:border-ink focus-within:shadow-[0_0_0_3px_var(--mint)]">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="flex-none text-muted"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onFocus={() => shownResults.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Buscar por nombre, categoría o material…"
          aria-label="Buscar productos"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={listOpen}
          aria-controls={listboxId}
          aria-activedescendant={listOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          autoComplete="off"
          className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
      </label>

      {listOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Sugerencias de búsqueda"
          className="absolute inset-x-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-xl border border-line bg-card shadow-lg"
        >
          {shownResults.map((r, i) => (
            <Link
              key={r.id}
              id={optionId(i)}
              role="option"
              aria-selected={activeIndex === i}
              tabIndex={-1}
              href={`/productos/${r.slug}`}
              onClick={() => {
                setOpen(false);
                setActiveIndex(-1);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex items-center gap-3 border-b border-line px-4 py-3 text-sm text-ink ${
                activeIndex === i ? "bg-mint-soft" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.images[0]}
                alt=""
                className="h-9 w-9 flex-none rounded-md border border-line bg-surface object-contain"
              />
              <span className="flex-1">{r.name}</span>
              <span className="tabular-nums text-xs text-muted">
                {formatCurrency(r.price)}
              </span>
            </Link>
          ))}
          <button
            type="button"
            id={optionId(shownResults.length)}
            role="option"
            aria-selected={activeIndex === shownResults.length}
            tabIndex={-1}
            onClick={goToResultsPage}
            onMouseEnter={() => setActiveIndex(shownResults.length)}
            className={`block w-full px-4 py-3 text-left text-sm font-medium text-accent ${
              activeIndex === shownResults.length ? "bg-mint-soft" : ""
            }`}
          >
            Ver todos los resultados para &ldquo;{query}&rdquo; →
          </button>
        </div>
      )}
    </div>
  );
}
