"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/require-admin";
import type { ReportStatus } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export async function setReportStatus(id: string, status: ReportStatus) {
  const { admin } = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({ status, reviewed_by_admin_id: admin.id, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/reports");
  return { error: null };
}
