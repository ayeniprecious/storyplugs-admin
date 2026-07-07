"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/require-admin";
import { createClient } from "@/lib/supabase/server";

export async function createReflection(formData: FormData) {
  await requireAdmin();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { error: "Reflection text is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("reflections").insert({ text });
  if (error) return { error: error.message };
  revalidatePath("/reflections");
  return { error: null };
}

export async function updateReflection(id: string, formData: FormData) {
  await requireAdmin();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { error: "Reflection text is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("reflections").update({ text }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/reflections");
  return { error: null };
}

export async function setReflectionStatus(id: string, status: "draft" | "published" | "archived") {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("reflections")
    .update({ status, published_at: status === "published" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/reflections");
  return { error: null };
}

export async function deleteReflection(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("reflections").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/reflections");
  return { error: null };
}
