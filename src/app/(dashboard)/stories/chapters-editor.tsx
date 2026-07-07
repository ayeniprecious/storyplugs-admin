"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { ChapterFormDialog } from "@/app/(dashboard)/stories/chapter-form-dialog";
import { deleteChapter } from "@/app/(dashboard)/stories/actions";
import { Button } from "@/components/ui/button";
import type { StoryChapter } from "@/lib/database.types";

export function ChaptersEditor({
  storyId,
  chapters,
}: {
  storyId: string;
  chapters: StoryChapter[];
}) {
  const [isPending, startTransition] = useTransition();

  function runDelete(chapterId: string) {
    startTransition(async () => {
      const result = await deleteChapter(storyId, chapterId);
      if (result.error) toast.error(result.error);
      else toast.success("Chapter deleted.");
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Chapters</h2>
        <ChapterFormDialog
          storyId={storyId}
          nextChapterNumber={chapters.length + 1}
          trigger={<Button size="sm">Add Chapter</Button>}
        />
      </div>
      {chapters.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No chapters — this story is read as a single page using the body above.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {chapters
            .sort((a, b) => a.chapter_number - b.chapter_number)
            .map((chapter) => (
              <li
                key={chapter.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span>
                  Ch. {chapter.chapter_number}
                  {chapter.title ? ` — ${chapter.title}` : ""}
                </span>
                <div className="flex gap-2">
                  <ChapterFormDialog
                    storyId={storyId}
                    chapter={chapter}
                    nextChapterNumber={chapters.length + 1}
                    trigger={
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    }
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={() => runDelete(chapter.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
