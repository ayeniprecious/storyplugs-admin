"use client";

import { useState } from "react";
import { toast } from "sonner";

import { createCategory, updateCategory } from "@/app/(dashboard)/categories/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/lib/database.types";

export function CategoryFormDialog({
  category,
  trigger,
}: {
  category?: Category;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = !!category;

  async function action(formData: FormData) {
    const result = isEdit
      ? await updateCategory(category!.slug, formData)
      : await createCategory(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(isEdit ? "Category updated." : "Category created.");
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "New Category"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "The slug can't change once created."
              : "The slug is generated from the name and can't change later."}
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required defaultValue={category?.name} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="icon">Icon (optional)</Label>
            <Input id="icon" name="icon" defaultValue={category?.icon ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sort_order">Sort order</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={category?.sort_order ?? 0}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">{isEdit ? "Save" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
