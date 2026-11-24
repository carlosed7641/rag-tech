"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DepartmentSelect } from "@/components/account/DepartmentSelect";

export function AddAddressForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("addresses").insert({
      user_id: userId,
      line1: String(formData.get("line1") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? "") || null,
      zip: String(formData.get("zip") ?? ""),
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start text-sm font-semibold text-accent hover:text-accent-ink"
      >
        + Añadir dirección
      </button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-4"
    >
      <input
        name="line1"
        required
        placeholder="Calle y número"
        className="rounded-[11px] border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-ink focus:ring-[3px] focus:ring-mint"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          name="city"
          required
          placeholder="Ciudad"
          className="rounded-[11px] border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-ink focus:ring-[3px] focus:ring-mint"
        />
        <DepartmentSelect />
      </div>
      <input
        name="zip"
        required
        placeholder="Código postal"
        className="rounded-[11px] border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-ink focus:ring-[3px] focus:ring-mint"
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-ink disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar dirección"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-line-strong px-4 py-2 text-xs text-ink hover:border-accent hover:text-accent"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
