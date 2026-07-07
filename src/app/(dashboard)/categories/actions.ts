"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/require-admin";
import { createClient } from "@/lib/supabase/server";

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim() || null;
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  if (!name) return { error: "Name is required." };

  const slug = slugify(name);
  if (!slug) return { error: "Name must contain at least one letter or number." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .insert({ slug, name, icon, sort_order: sortOrder });

  if (error) return { error: error.message };
  revalidatePath("/categories");
  return { error: null };
}

export async function updateCategory(slug: string, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim() || null;
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  if (!name) return { error: "Name is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name, icon, sort_order: sortOrder })
    .eq("slug", slug);

  if (error) return { error: error.message };
  revalidatePath("/categories");
  return { error: null };
}

export async function deleteCategory(slug: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("slug", slug);

  if (error) {
    const message = error.message.includes("foreign key")
      ? "Can't delete — stories still use this category. Reassign them first."
      : error.message;
    return { error: message };
  }
  revalidatePath("/categories");
  return { error: null };
}
