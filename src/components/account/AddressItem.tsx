"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { DepartmentSelect } from "@/components/account/DepartmentSelect";

type Address = Tables<"addresses">;

export function AddressItem({ address }: { address: Address }) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(formData: FormData) {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("addresses")
      .update({
        line1: String(formData.get("line1") ?? ""),
        city: String(formData.get("city") ?? ""),
        state: String(formData.get("state") ?? "") || null,
        zip: String(formData.get("zip") ?? ""),
      })
      .eq("id", address.id);
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMode("view");
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm("¿Eliminar esta dirección?")) return;
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("addresses").delete().eq("id", address.id);
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  if (mode === "edit") {
    return (
      <form
        action={handleUpdate}
        className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-4"
      >
        <input
          name="line1"
          required
          defaultValue={address.line1}
          placeholder="Calle y número"
          className="rounded-[11px] border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-ink focus:ring-[3px] focus:ring-mint"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            name="city"
            required
            defaultValue={address.city}
            placeholder="Ciudad"
            className="rounded-[11px] border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-ink focus:ring-[3px] focus:ring-mint"
          />
          <DepartmentSelect defaultValue={address.state ?? ""} />
        </div>
        <input
          name="zip"
          required
          defaultValue={address.zip}
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
            {pending ? "Guardando…" : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => setMode("view")}
            className="rounded-xl border border-line-strong px-4 py-2 text-xs text-ink hover:border-accent hover:text-accent"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-4 text-sm text-ink">
        <span className="min-w-0 truncate">
          {address.line1}, {address.city}
          {address.state ? `, ${address.state}` : ""} — {address.zip}
        </span>
        <div className="flex flex-none items-center gap-3 text-xs">
          <button onClick={() => setMode("edit")} className="text-muted hover:text-accent">
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={pending}
            className="text-muted hover:text-danger disabled:opacity-60"
          >
            Eliminar
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
