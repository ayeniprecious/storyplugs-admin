import Link from "next/link";

import { ANCHOR_LABELS, STYLE_LABELS } from "@/app/(dashboard)/sections/constants";
import { DeleteSectionButton } from "@/app/(dashboard)/sections/delete-section-button";
import { SectionActiveToggle } from "@/app/(dashboard)/sections/section-active-toggle";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CuratedSection } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

async function getSectionsWithCounts() {
  const supabase = await createClient();
  const { data: sections } = await supabase
    .from("curated_sections")
    .select("*")
    .order("target_page", { ascending: true })
    .order("sort_order", { ascending: true });

  const { data: links } = await supabase.from("curated_section_stories").select("section_id");
  const counts = new Map<string, number>();
  for (const l of links ?? []) {
    counts.set(l.section_id, (counts.get(l.section_id) ?? 0) + 1);
  }

  return (
    (sections as CuratedSection[] | null)?.map((s) => ({ ...s, storyCount: counts.get(s.id) ?? 0 })) ?? []
  );
}

export default async function SectionsPage() {
  const sections = await getSectionsWithCounts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sections</h1>
          <p className="text-sm text-muted-foreground">
            Custom, story-picked rows placed on the Home or Search page.
          </p>
        </div>
        <Button render={<Link href="/sections/new" />}>New Section</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Page</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Style</TableHead>
              <TableHead>Stories</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No sections yet.
                </TableCell>
              </TableRow>
            )}
            {sections.map((section) => (
              <TableRow key={section.id}>
                <TableCell className="font-medium">{section.title}</TableCell>
                <TableCell className="capitalize">{section.target_page}</TableCell>
                <TableCell className="text-muted-foreground">
                  {ANCHOR_LABELS[section.anchor] ?? section.anchor}
                </TableCell>
                <TableCell>{STYLE_LABELS[section.display_style]}</TableCell>
                <TableCell>{section.storyCount}</TableCell>
                <TableCell>
                  <SectionActiveToggle id={section.id} isActive={section.is_active} />
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" render={<Link href={`/sections/${section.id}`} />}>
                    Edit
                  </Button>
                  <DeleteSectionButton id={section.id} title={section.title} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
