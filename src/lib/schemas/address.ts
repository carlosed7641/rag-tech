import { z } from "zod";
import { DEPARTAMENTOS_CO } from "@/lib/colombia";

/**
 * Dirección de envío. Compartido por el checkout (y reutilizable por el
 * formulario de direcciones de /cuenta y cualquier API route) para no
 * duplicar reglas de validación.
 */
export const addressSchema = z.object({
  line1: z.string().trim().min(1, "Ingresa la calle y el número"),
  city: z.string().trim().min(1, "Ingresa la ciudad"),
  // Opcional: vacío o uno de los departamentos de Colombia.
  state: z.union([z.literal(""), z.enum(DEPARTAMENTOS_CO)]).optional(),
  zip: z.string().trim().min(1, "Ingresa el código postal"),
});
export type AddressInput = z.infer<typeof addressSchema>;
