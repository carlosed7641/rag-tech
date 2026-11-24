import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renderiza el Markdown de las respuestas del asistente (negritas, listas,
 * enlaces, tablas…) con el estilo de la marca.
 *
 * Seguridad: react-markdown NO interpreta HTML crudo por defecto (no se usa
 * rehype-raw), así que un `<script>` en la respuesta se muestra como texto, y
 * su `urlTransform` por defecto neutraliza enlaces `javascript:`.
 */
export function ChatMarkdown({ text, tone }: { text: string; tone: "light" | "dark" }) {
  const dark = tone === "dark";
  const strong = dark ? "font-semibold text-white" : "font-semibold text-ink";
  const link = dark
    ? "font-medium text-lime underline underline-offset-2 hover:no-underline"
    : "font-medium text-accent underline underline-offset-2 hover:text-accent-ink";
  const subtle = dark ? "border-white/10" : "border-line";

  const components: Components = {
    p: ({ children }) => <p className="[&:not(:first-child)]:mt-2.5">{children}</p>,
    strong: ({ children }) => <strong className={strong}>{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    ul: ({ children }) => (
      <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 first:mt-0 marker:text-current/50">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5 first:mt-0 marker:text-current/60">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-0.5">{children}</li>,
    a: ({ href, children }) => {
      const external = Boolean(href && /^https?:\/\//.test(href));
      return (
        <a
          href={href}
          className={link}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
    // Los títulos del modelo se ven como texto destacado, no como encabezados
    // grandes dentro de una burbuja de chat.
    h1: ({ children }) => <p className={`mt-3 first:mt-0 ${strong}`}>{children}</p>,
    h2: ({ children }) => <p className={`mt-3 first:mt-0 ${strong}`}>{children}</p>,
    h3: ({ children }) => <p className={`mt-3 first:mt-0 ${strong}`}>{children}</p>,
    hr: () => <hr className={`my-3 ${subtle}`} />,
    blockquote: ({ children }) => (
      <blockquote className={`mt-2 border-l-2 pl-3 opacity-90 ${subtle}`}>{children}</blockquote>
    ),
    code: ({ children }) => (
      <code
        className={`rounded px-1 py-0.5 text-[0.9em] ${dark ? "bg-white/10" : "bg-surface"}`}
      >
        {children}
      </code>
    ),
    table: ({ children }) => (
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-left text-[14px] tabular-nums">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className={`border-b px-2 py-1.5 font-semibold ${subtle}`}>{children}</th>
    ),
    td: ({ children }) => <td className={`border-b px-2 py-1.5 ${subtle}`}>{children}</td>,
  };

  return (
    <div className="break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
