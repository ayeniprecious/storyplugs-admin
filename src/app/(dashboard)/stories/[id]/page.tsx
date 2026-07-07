import { notFound } from "next/navigation";

import { updateStoryFormAction } from "@/app/(dashboard)/stories/actions";
import { ChaptersEditor } from "@/app/(dashboard)/stories/chapters-editor";
import { StoryForm } from "@/app/(dashboard)/stories/story-form";
import { StoryStatusPanel } from "@/app/(dashboard)/stories/story-status-panel";
import type { Category, Story, StoryChapter } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: story }, { data: categoriesData }, { data: chaptersData }] = await Promise.all([
    supabase.from("stories").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("story_chapters").select("*").eq("story_id", id),
  ]);

  if (!story) notFound();

  const categories = (categoriesData as Category[] | null) ?? [];
  const chapters = (chaptersData as StoryChapter[] | null) ?? [];

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit Story</h1>
      <StoryStatusPanel story={story as Story} />
      <StoryForm
        story={story as Story}
        categories={categories}
        formAction={updateStoryFormAction.bind(null, id)}
        submitLabel="Save Changes"
      />
      <ChaptersEditor storyId={id} chapters={chapters} />
    </div>
  );
}
