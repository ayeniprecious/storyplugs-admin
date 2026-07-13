import { notFound } from "next/navigation";

import { updateSection } from "@/app/(dashboard)/sections/actions";
import { SectionForm } from "@/app/(dashboard)/sections/section-form";
import type { CuratedSection } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export default async function EditSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: section }, { data: storiesData }, { data: linksData }] = await Promise.all([
    supabase.from("curated_sections").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("stories")
      .select("id, title, category")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase
      .from("curated_section_stories")
      .select("story_id")
      .eq("section_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  if (!section) notFound();

  const stories = storiesData ?? [];
  const initialStoryIds = (linksData ?? []).map((l) => l.story_id as string);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit Section</h1>
      <SectionForm
        section={section as CuratedSection}
        initialStoryIds={initialStoryIds}
        stories={stories}
        formAction={updateSection.bind(null, id)}
        submitLabel="Save Changes"
      />
    </div>
  );
}
