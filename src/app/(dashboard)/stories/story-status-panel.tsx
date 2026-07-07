"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { deleteStory, setStoryStatus, toggleStoryFlag } from "@/app/(dashboard)/stories/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ContentStatus, Story } from "@/lib/database.types";
import { useRouter } from "next/navigation";

const NEXT_STATUS: Partial<Record<ContentStatus, { label: string; status: ContentStatus }[]>> = {
  draft: [{ label: "Submit for Review", status: "pending_review" }],
  pending_review: [
    { label: "Approve", status: "approved" },
    { label: "Reject", status: "draft" },
  ],
  approved: [
    { label: "Publish", status: "published" },
    { label: "Back to Draft", status: "draft" },
  ],
  published: [{ label: "Archive", status: "archived" }],
  archived: [{ label: "Restore to Draft", status: "draft" }],
};

export function StoryStatusPanel({ story }: { story: Story }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function runSetStatus(status: ContentStatus) {
    startTransition(async () => {
      const result = await setStoryStatus(story.id, status);
      if (result.error) toast.error(result.error);
      else toast.success("Status updated.");
    });
  }

  function runToggle(field: "is_featured" | "is_pinned", value: boolean) {
    startTransition(async () => {
      const result = await toggleStoryFlag(story.id, field, value);
      if (result.error) toast.error(result.error);
    });
  }

  function runDelete() {
    startTransition(async () => {
      const result = await deleteStory(story.id);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Story deleted.");
        router.push("/stories");
      }
    });
  }

  const transitions = NEXT_STATUS[story.status] ?? [];

  return (
    <div className="flex flex-col gap-4 rounded-md border p-4">
      <div className="flex flex-wrap gap-2">
        {transitions.map((t) => (
          <Button key={t.status} size="sm" disabled={isPending} onClick={() => runSetStatus(t.status)}>
            {t.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="is_featured"
          checked={story.is_featured}
          disabled={isPending}
          onCheckedChange={(value) => runToggle("is_featured", value)}
        />
        <Label htmlFor="is_featured">Featured</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="is_pinned"
          checked={story.is_pinned}
          disabled={isPending}
          onCheckedChange={(value) => runToggle("is_pinned", value)}
        />
        <Label htmlFor="is_pinned">Pinned</Label>
      </div>

      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="destructive" size="sm" className="self-start" />}>
          Delete Story
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this story?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes it permanently, including chapters, favorites, and reading history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={runDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
