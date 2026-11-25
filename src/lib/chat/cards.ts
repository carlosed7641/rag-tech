import type { ProductCard } from "@/lib/chat/tools";

/** Máximo de tarjetas por respuesta. */
export const MAX_CARDS = 6;

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita tildes
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Elige qué tarjetas mostrar: solo los productos que Claude NOMBRA en su
 * respuesta final, en el orden en que aparecen en el texto.
 *
 * Por qué: las búsquedas (sobre todo la semántica) siempre devuelven los N más
 * parecidos aunque no tengan relación con la pregunta —con 2 mouses en el
 * catálogo, el resto de puestos se llena con mousepads, teclados, etc.—. Claude
 * filtra bien en su texto; las tarjetas deben respetar esa decisión, no
 * mostrar los resultados crudos.
 *
 * Los nombres se comparan sin mayúsculas ni tildes. Se prueban de más largo a
 * más corto y cada coincidencia "consume" su tramo del texto, para que
 * nombrar "Mouse inalámbrico rojo" no active también un "Mouse inalámbrico".
 *
 * `exclude`: nombres que nunca deben salir como tarjeta aunque se mencionen,
 * p. ej. el producto sobre el que pregunta el usuario ("¿hay algo parecido
 * más barato?"): Claude lo nombra para comparar, pero no es una sugerencia.
 */
export function selectMentionedCards(
  text: string,
  pool: ProductCard[],
  { max = MAX_CARDS, exclude = [] }: { max?: number; exclude?: string[] } = {},
): ProductCard[] {
  const excluded = new Set(exclude.map((n) => normalize(n).trim()));
  let haystack = normalize(text);
  const byLength = [...pool].sort((a, b) => b.name.length - a.name.length);

  const found: { card: ProductCard; at: number }[] = [];
  for (const card of byLength) {
    const needle = normalize(card.name).trim();
    if (!needle) continue;
    const at = haystack.indexOf(needle);
    if (at === -1) continue;
    // Aun si está excluido, consume su tramo (para no activar nombres más cortos).
    if (!excluded.has(needle)) found.push({ card, at });
    // Reemplaza por espacios (misma longitud) para conservar las posiciones.
    haystack = haystack.slice(0, at) + " ".repeat(needle.length) + haystack.slice(at + needle.length);
  }

  return found
    .sort((a, b) => a.at - b.at)
    .slice(0, max)
    .map((f) => f.card);
}
