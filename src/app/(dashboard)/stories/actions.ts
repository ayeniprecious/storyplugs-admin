"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/require-admin";
import type { ContentStatus } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

function storyFieldsFromForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    category: String(formData.get("category") ?? ""),
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    audio_url: String(formData.get("audio_url") ?? "").trim() || null,
    reflection_question: String(formData.get("reflection_question") ?? "").trim() || null,
    daily_lesson: String(formData.get("daily_lesson") ?? "").trim() || null,
  };
}

export type StoryFormState = { error: string | null };

export async function createStoryFormAction(_prevState: StoryFormState, formData: FormData) {
  return createStory(formData);
}

export async function updateStoryFormAction(
  id: string,
  _prevState: StoryFormState,
  formData: FormData
) {
  return updateStory(id, formData);
}

export async function createStory(formData: FormData) {
  const { admin } = await requireAdmin();
  const fields = storyFieldsFromForm(formData);
  if (!fields.title || !fields.body || !fields.category) {
    return { error: "Title, body, and category are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories")
    .insert({ ...fields, generated_by_admin_id: admin.id })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Failed to create story." };
  revalidatePath("/stories");
  redirect(`/stories/${data.id}`);
}

export async function updateStory(id: string, formData: FormData) {
  await requireAdmin();
  const fields = storyFieldsFromForm(formData);
  if (!fields.title || !fields.body || !fields.category) {
    return { error: "Title, body, and category are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("stories").update(fields).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/stories");
  revalidatePath(`/stories/${id}`);
  return { error: null };
}

export async function setStoryStatus(id: string, status: ContentStatus, scheduledFor?: string) {
  const { admin } = await requireAdmin();
  const supabase = await createClient();
  const updates: Record<string, unknown> = { status };
  if (status === "published") {
    // A future scheduledFor keeps the story hidden from public reads until
    // then (enforced by RLS on stories.published_at), while still marking
    // it as published in the admin's own view.
    const scheduledDate = scheduledFor ? new Date(scheduledFor) : null;
    updates.published_at =
      scheduledDate && scheduledDate.getTime() > Date.now()
        ? scheduledDate.toISOString()
        : new Date().toISOString();
    updates.approved_by_admin_id = admin.id;
  }
  if (status === "approved") {
    updates.approved_by_admin_id = admin.id;
  }

  const { error } = await supabase.from("stories").update(updates).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/stories");
  revalidatePath(`/stories/${id}`);
  return { error: null };
}

export async function publishStoryNow(id: string) {
  return setStoryStatus(id, "published");
}

export async function toggleStoryFlag(id: string, field: "is_featured" | "is_pinned", value: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("stories").update({ [field]: value }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/stories");
  revalidatePath(`/stories/${id}`);
  return { error: null };
}

export async function deleteStory(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("stories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/stories");
  return { error: null };
}

export async function upsertChapter(
  storyId: string,
  chapterId: string | null,
  formData: FormData
) {
  await requireAdmin();
  const chapterNumber = Number(formData.get("chapter_number") ?? 0);
  const title = String(formData.get("title") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim();
  if (!chapterNumber || !body) return { error: "Chapter number and body are required." };

  const supabase = await createClient();
  const { error } = chapterId
    ? await supabase
        .from("story_chapters")
        .update({ chapter_number: chapterNumber, title, body })
        .eq("id", chapterId)
    : await supabase
        .from("story_chapters")
        .insert({ story_id: storyId, chapter_number: chapterNumber, title, body });

  if (error) return { error: error.message };
  revalidatePath(`/stories/${storyId}`);
  return { error: null };
}

export async function deleteChapter(storyId: string, chapterId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("story_chapters").delete().eq("id", chapterId);
  if (error) return { error: error.message };
  revalidatePath(`/stories/${storyId}`);
  return { error: null };
}
