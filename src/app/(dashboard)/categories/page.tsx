import { CategoryFormDialog } from "@/app/(dashboard)/categories/category-form-dialog";
import { DeleteCategoryButton } from "@/app/(dashboard)/categories/delete-category-button";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Category } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

async function getCategoriesWithCounts() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: stories } = await supabase.from("stories").select("category");
  const counts = new Map<string, number>();
  for (const s of stories ?? []) {
    counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  }

  return (categories as Category[] | null)?.map((c) => ({ ...c, storyCount: counts.get(c.slug) ?? 0 })) ?? [];
}

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <CategoryFormDialog trigger={<Button>New Category</Button>} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead>Stories</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.slug}>
                <TableCell>{category.name}</TableCell>
                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                <TableCell>{category.sort_order}</TableCell>
                <TableCell>{category.storyCount}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <CategoryFormDialog
                    category={category}
                    trigger={
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    }
                  />
                  <DeleteCategoryButton slug={category.slug} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
