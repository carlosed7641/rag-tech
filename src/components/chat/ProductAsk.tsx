"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chat";
import { ArrowUpIcon } from "@/components/ui/icons";

/**
 * "Pregúntale a la ficha": entrada contextual al asistente desde el detalle
 * de producto. Antepone el nombre del producto a la pregunta (el modelo lo
 * busca con sus tools, no recibe datos privilegiados) y abre el drawer con
 * la misma conversación global.
 */
export function ProductAsk({ productName }: { productName: string }) {
  const send = useChatStore((s) => s.send);
  const pending = useChatStore((s) => s.pending);
  const [value, setValue] = useState("");

  const suggestions = [
    "¿Para qué uso me lo recomiendas?",
    "¿Hay algo parecido más barato?",
    "¿Qué me conviene comprar junto con este?",
  ];

  function ask(question: string) {
    const q = question.trim();
    if (!q || pending) return;
    send(`Sobre el producto "${productName}": ${q}`, { openPanel: true });
    setValue("");
  }

  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-2xl bg-forest p-7 text-line">
      <div className="flex flex-col gap-1.5">
        <span className="eyebrow text-lime">Pregúntale a la ficha</span>
        <h2 className="text-[26px] font-bold leading-tight text-white">
          ¿Dudas sobre {productName}?
        </h2>
      </div>
      <div className="flex flex-col gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => ask(s)}
            disabled={pending}
            className="min-h-11 rounded-[10px] border border-white/[0.08] bg-white/[0.05] px-3.5 py-2.5 text-left text-[15px] transition-colors hover:border-lime/50 hover:bg-white/[0.08]"
          >
            {s}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(value);
        }}
        className="mt-auto flex flex-col gap-2"
      >
        <label htmlFor="ask-product" className="text-sm text-sage">
          Escribe tu pregunta
        </label>
        <div className="flex gap-2 rounded-xl border border-white/[0.12] bg-white/[0.05] p-1.5 focus-within:border-lime/60">
          <input
            id="ask-product"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            placeholder="¿Funciona con iPhone y Android?"
            className="h-11 min-w-0 flex-1 bg-transparent px-2.5 text-[15px] text-white outline-none placeholder:text-sage"
          />
          <button
            type="submit"
            disabled={pending || !value.trim()}
            aria-label="Enviar pregunta"
            className="flex h-11 w-11 flex-none items-center justify-center rounded-[9px] bg-lime text-ink disabled:opacity-40"
          >
            <ArrowUpIcon size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
