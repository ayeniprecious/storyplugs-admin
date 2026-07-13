"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/require-admin";
import { createClient } from "@/lib/supabase/server";
import type { CuratedSectionPage, CuratedSectionStyle } from "@/lib/database.types";

function sectionFieldsFromForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    target_page: String(formData.get("target_page") ?? "home") as CuratedSectionPage,
    anchor: String(formData.get("anchor") ?? ""),
    display_style: String(formData.get("display_style") ?? "poster") as CuratedSectionStyle,
    is_active: formData.get("is_active") === "true",
  };
}

// Simplest correct approach to persisting order: replace the whole set on every
// save rather than diffing -- a section's story list is small and edited as a
// whole in the form anyway, so there's nothing to gain from a partial update.
async function replaceSectionStories(sectionId: string, storyIds: string[]) {
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("curated_section_stories")
    .delete()
    .eq("section_id", sectionId);
  if (deleteError) return deleteError;
  if (storyIds.length === 0) return null;

  const rows = storyIds.map((story_id, index) => ({
    section_id: sectionId,
    story_id,
    sort_order: index,
  }));
  const { error } = await supabase.from("curated_section_stories").insert(rows);
  return error;
}

export async function createSection(formData: FormData) {
  await requireAdmin();
  const fields = sectionFieldsFromForm(formData);
  if (!fields.title || !fields.anchor) {
    return { error: "Title and position are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("curated_sections")
    .insert(fields)
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "Failed to create section." };

  const storyIds = formData.getAll("story_ids").map(String);
  const storyError = await replaceSectionStories(data.id, storyIds);
  if (storyError) return { error: storyError.message };

  revalidatePath("/sections");
  redirect(`/sections/${data.id}`);
}

export async function updateSection(id: string, formData: FormData) {
  await requireAdmin();
  const fields = sectionFieldsFromForm(formData);
  if (!fields.title || !fields.anchor) {
    return { error: "Title and position are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("curated_sections").update(fields).eq("id", id);
  if (error) return { error: error.message };

  const storyIds = formData.getAll("story_ids").map(String);
  const storyError = await replaceSectionStories(id, storyIds);
  if (storyError) return { error: storyError.message };

  revalidatePath("/sections");
  revalidatePath(`/sections/${id}`);
  return { error: null };
}

export async function deleteSection(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("curated_sections").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/sections");
  return { error: null };
}

export async function toggleSectionActive(id: string, value: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("curated_sections").update({ is_active: value }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/sections");
  return { error: null };
}
