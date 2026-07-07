"use client";

import { useState } from "react";
import { toast } from "sonner";

import { upsertChapter } from "@/app/(dashboard)/stories/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StoryChapter } from "@/lib/database.types";

export function ChapterFormDialog({
  storyId,
  chapter,
  nextChapterNumber,
  trigger,
}: {
  storyId: string;
  chapter?: StoryChapter;
  nextChapterNumber: number;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = !!chapter;

  async function action(formData: FormData) {
    const result = await upsertChapter(storyId, chapter?.id ?? null, formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(isEdit ? "Chapter updated." : "Chapter added.");
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Chapter" : "Add Chapter"}</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="chapter_number">Chapter number</Label>
            <Input
              id="chapter_number"
              name="chapter_number"
              type="number"
              required
              defaultValue={chapter?.chapter_number ?? nextChapterNumber}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input id="title" name="title" defaultValue={chapter?.title ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="body">Body</Label>
            <Textarea id="body" name="body" required rows={8} defaultValue={chapter?.body} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">{isEdit ? "Save" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
