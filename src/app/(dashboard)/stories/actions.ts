"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/require-admin";
import type { ContentStatus } from "@/lib/database.types";
import { slugify } from "@/lib/slugify";
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

// "gifting, helpful, mercy" -> [{slug: "gifting", name: "gifting"}, ...],
// case-insensitively deduped by slug so "Hope" and "hope" collapse to one tag.
function parseTagRows(raw: string) {
  const seenSlugs = new Set<string>();
  const rows: { slug: string; name: string }[] = [];
  for (const part of raw.split(",")) {
    const name = part.trim();
    if (!name) continue;
    const slug = slugify(name);
    if (!slug || seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    rows.push({ slug, name });
  }
  return rows;
}

// Upserts any new tag names into the canonical `tags` table (first writer
// wins the display name for a given slug), then replaces this story's
// story_tags rows wholesale -- same delete-then-reinsert approach as curated
// sections' replaceSectionStories, simpler than diffing the two sets.
async function syncStoryTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storyId: string,
  rawTags: string
) {
  const rows = parseTagRows(rawTags);

  if (rows.length > 0) {
    const { error } = await supabase.from("tags").upsert(rows, { onConflict: "slug", ignoreDuplicates: true });
    if (error) return error.message;
  }

  const { error: deleteError } = await supabase.from("story_tags").delete().eq("story_id", storyId);
  if (deleteError) return deleteError.message;

  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from("story_tags")
      .insert(rows.map((row) => ({ story_id: storyId, tag_slug: row.slug })));
    if (insertError) return insertError.message;
  }

  return null;
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

  const tagsError = await syncStoryTags(supabase, data.id, String(formData.get("tags") ?? ""));
  if (tagsError) return { error: tagsError };

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

  const tagsError = await syncStoryTags(supabase, id, String(formData.get("tags") ?? ""));
  if (tagsError) return { error: tagsError };

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

export async function toggleStoryFlag(
  id: string,
  field: "is_featured" | "is_pinned" | "is_mature",
  value: boolean
) {
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
