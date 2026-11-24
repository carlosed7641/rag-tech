"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { ORDER_STATUS_VALUES, type OrderStatus } from "@/lib/order-status";

/** Resultado para `useActionState` en el formulario de estado de la orden. */
export type UpdateOrderStatusState = {
  /** Estado guardado en la DB tras el último intento. */
  status: string;
  ok: boolean | null;
  message: string | null;
};

export async function updateOrderStatus(
  orderId: string,
  prevState: UpdateOrderStatusState,
  formData: FormData,
): Promise<UpdateOrderStatusState> {
  await requireAdmin();
  const supabase = await createClient();

  const status = String(formData.get("status"));
  if (!ORDER_STATUS_VALUES.includes(status as OrderStatus)) {
    return { status: prevState.status, ok: false, message: "Estado inválido." };
  }

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) {
    return {
      status: prevState.status,
      ok: false,
      message: "No se pudo actualizar el estado. Intenta de nuevo.",
    };
  }

  revalidatePath(`/admin/ordenes/${orderId}`);
  revalidatePath("/admin/ordenes");
  revalidatePath("/admin");

  return {
    status,
    ok: true,
    message: "Estado actualizado correctamente.",
  };
}
