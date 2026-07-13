import { createStoryFormAction } from "@/app/(dashboard)/stories/actions";
import { StoryForm } from "@/app/(dashboard)/stories/story-form";
import type { Category, Tag } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export default async function NewStoryPage() {
  const supabase = await createClient();
  const [{ data: categoriesData }, { data: tagsData }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("tags").select("*").order("name", { ascending: true }),
  ]);
  const categories = (categoriesData as Category[] | null) ?? [];
  const tags = (tagsData as Tag[] | null) ?? [];

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">New Story</h1>
      <StoryForm
        categories={categories}
        tags={tags}
        initialTags={[]}
        formAction={createStoryFormAction}
        submitLabel="Create Story"
      />
    </div>
  );
}
