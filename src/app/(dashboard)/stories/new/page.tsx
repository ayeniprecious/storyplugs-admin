import { createStoryFormAction } from "@/app/(dashboard)/stories/actions";
import { StoryForm } from "@/app/(dashboard)/stories/story-form";
import type { Category } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export default async function NewStoryPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
  const categories = (data as Category[] | null) ?? [];

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">New Story</h1>
      <StoryForm categories={categories} formAction={createStoryFormAction} submitLabel="Create Story" />
    </div>
  );
}
