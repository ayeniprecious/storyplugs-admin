"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/require-admin";
import { createClient } from "@/lib/supabase/server";

export async function approveSubmission(id: string) {
  const { admin } = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("story_submissions")
    .update({
      status: "approved",
      reviewed_by_admin_id: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/submissions");
  return { error: null };
}

export async function rejectSubmission(id: string, adminNote: string | null) {
  const { admin } = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("story_submissions")
    .update({
      status: "rejected",
      admin_note: adminNote,
      reviewed_by_admin_id: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/submissions");
  return { error: null };
}

export async function setSubmissionVisibility(id: string, isVisible: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("story_submissions").update({ is_visible: isVisible }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/submissions");
  return { error: null };
}
