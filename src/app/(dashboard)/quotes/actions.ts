"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/require-admin";
import { createClient } from "@/lib/supabase/server";

export async function createQuote(formData: FormData) {
  await requireAdmin();
  const text = String(formData.get("text") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim() || null;
  if (!text) return { error: "Quote text is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("quotes").insert({ text, author });
  if (error) return { error: error.message };
  revalidatePath("/quotes");
  return { error: null };
}

export async function updateQuote(id: string, formData: FormData) {
  await requireAdmin();
  const text = String(formData.get("text") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim() || null;
  if (!text) return { error: "Quote text is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("quotes").update({ text, author }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/quotes");
  return { error: null };
}

export async function setQuoteStatus(id: string, status: "draft" | "published" | "archived") {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("quotes")
    .update({ status, published_at: status === "published" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/quotes");
  return { error: null };
}

export async function deleteQuote(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/quotes");
  return { error: null };
}
