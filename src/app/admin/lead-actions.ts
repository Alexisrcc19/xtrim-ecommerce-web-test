"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { assertActionOrigin, requireAdmin } from "@/lib/admin/auth";
import {
  changeLeadStatus,
  createLead,
  deleteLead,
  editLead,
  getLead,
} from "@/lib/admin/api";
import { statusChange, validUuid } from "@/lib/admin/validation";
import { validateLead } from "@/lib/lead-validation";
import type { ActionResult, Lead } from "@/lib/admin/types";

export async function loadLead(
  id: string,
): Promise<{ lead?: Lead; error?: string }> {
  await requireAdmin();
  if (!validUuid(id)) return { error: "Identificador inválido." };
  try {
    return { lead: (await getLead(id)).data };
  } catch (error) {
    unstable_rethrow(error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo consultar el lead.",
    };
  }
}
export async function mutateLead(
  id: string | null,
  operation: "create" | "edit" | "status" | "delete",
  data: FormData,
): Promise<ActionResult> {
  await assertActionOrigin();
  await requireAdmin();
  if (operation !== "create" && (!id || !validUuid(id)))
    return { error: "Identificador inválido." };
  const text = (field: string) => String(data.get(field) || "").trim();
  try {
    if (operation === "delete" && id) await deleteLead(id);
    else if (operation === "status" && id)
      await changeLeadStatus(
        id,
        statusChange(text("status"), text("outcome"), text("sale_amount")),
      );
    else if (operation === "create" || operation === "edit") {
      const input = {
        full_name: text("full_name"),
        phone: text("phone"),
        province: text("province"),
        plan_id: text("plan_id"),
      };
      const errors = validateLead(input);
      if (!validUuid(input.plan_id))
        errors.plan_id = "Selecciona un plan válido.";
      const error = Object.values(errors)[0];
      if (error) return { error };
      if (operation === "create") await createLead(input);
      else if (id) {
        const current = (await getLead(id)).data;
        const { plan_id, ...fields } = input;
        await editLead(id, current.plan_id === plan_id ? fields : input);
      }
    } else return { error: "Operación inválida." };
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo completar la operación.",
    };
  }
}
