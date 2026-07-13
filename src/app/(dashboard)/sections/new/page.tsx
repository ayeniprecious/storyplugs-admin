import { createSection } from "@/app/(dashboard)/sections/actions";
import { SectionForm } from "@/app/(dashboard)/sections/section-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewSectionPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("id, title, category")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  const stories = data ?? [];

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">New Section</h1>
      <SectionForm stories={stories} formAction={createSection} submitLabel="Create Section" />
    </div>
  );
}
