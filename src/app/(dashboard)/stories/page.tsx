import Link from "next/link";

import { ContentStatusBadge } from "@/components/content-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Category, ContentStatus, Story } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; q?: string }>;
}) {
  const { status, category, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("stories").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status as ContentStatus);
  if (category) query = query.eq("category", category);
  if (q) query = query.ilike("title", `%${q}%`);

  const [{ data: stories }, { data: categoriesData }] = await Promise.all([
    query,
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
  ]);

  const categories = (categoriesData as Category[] | null) ?? [];
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Stories</h1>
        <Button render={<Link href="/stories/new" />} nativeButton={false}>
          New Story
        </Button>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <input type="text" name="q" placeholder="Search title..." defaultValue={q}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="pending_review">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select
          name="category"
          defaultValue={category ?? ""}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {((stories as Story[] | null) ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No stories found.
                </TableCell>
              </TableRow>
            ) : (
              (stories as Story[]).map((story) => (
                <TableRow key={story.id}>
                  <TableCell className="max-w-xs truncate">{story.title}</TableCell>
                  <TableCell>{categoryName.get(story.category) ?? story.category}</TableCell>
                  <TableCell>
                    <ContentStatusBadge status={story.status} />
                  </TableCell>
                  <TableCell className="flex gap-1">
                    {story.is_featured && <Badge variant="secondary">Featured</Badge>}
                    {story.is_pinned && <Badge variant="secondary">Pinned</Badge>}
                  </TableCell>
                  <TableCell>
                    {story.published_at ? new Date(story.published_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={`/stories/${story.id}`} />}
                      nativeButton={false}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
