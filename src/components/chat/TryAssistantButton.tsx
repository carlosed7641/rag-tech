"use client";

import { useChatStore } from "@/store/chat";
import { ArrowRightIcon } from "@/components/ui/icons";

/** CTA "Probar el asistente" (sección "Cómo funciona"): abre el panel del asistente. */
export function TryAssistantButton() {
  const setOpen = useChatStore((s) => s.setOpen);
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex min-h-12 items-center gap-2 rounded-[11px] bg-lime px-5 text-[15px] font-semibold text-ink transition-transform hover:-translate-y-0.5"
    >
      Probar el asistente
      <ArrowRightIcon size={16} />
    </button>
  );
}
