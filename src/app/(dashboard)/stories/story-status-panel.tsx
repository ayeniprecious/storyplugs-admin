"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteStory,
  publishStoryNow,
  setStoryStatus,
  toggleStoryFlag,
} from "@/app/(dashboard)/stories/actions";
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
import { Input } from "@/components/ui/input";
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
  approved: [{ label: "Back to Draft", status: "draft" }],
  published: [{ label: "Archive", status: "archived" }],
  archived: [{ label: "Restore to Draft", status: "draft" }],
};

export function StoryStatusPanel({ story }: { story: Story }) {
  const [isPending, startTransition] = useTransition();
  const [scheduledFor, setScheduledFor] = useState("");
  const router = useRouter();

  const isScheduled =
    story.status === "published" &&
    !!story.published_at &&
    new Date(story.published_at).getTime() > Date.now();

  function runSetStatus(status: ContentStatus) {
    startTransition(async () => {
      const result = await setStoryStatus(story.id, status);
      if (result.error) toast.error(result.error);
      else toast.success("Status updated.");
    });
  }

  function runPublish() {
    startTransition(async () => {
      const result = await setStoryStatus(story.id, "published", scheduledFor || undefined);
      if (result.error) toast.error(result.error);
      else toast.success(scheduledFor ? "Story scheduled." : "Story published.");
    });
  }

  function runPublishNow() {
    startTransition(async () => {
      const result = await publishStoryNow(story.id);
      if (result.error) toast.error(result.error);
      else toast.success("Story published.");
    });
  }

  function runToggle(field: "is_featured" | "is_pinned" | "is_mature", value: boolean) {
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
      {isScheduled && (
        <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">
          <p className="font-medium text-warning">
            Scheduled to publish {new Date(story.published_at!).toLocaleString()}
          </p>
          <Button size="sm" className="mt-2" disabled={isPending} onClick={runPublishNow}>
            Publish Now
          </Button>
        </div>
      )}

      {story.status === "approved" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="scheduledFor">Publish (leave blank for immediately)</Label>
          <Input
            id="scheduledFor"
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
          <Button size="sm" className="self-start" disabled={isPending} onClick={runPublish}>
            {scheduledFor ? "Schedule Story" : "Publish"}
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {transitions.map((t) => (
          <Button
            key={t.status}
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => runSetStatus(t.status)}
          >
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
      <div className="flex items-center gap-2">
        <Switch
          id="is_mature"
          checked={story.is_mature}
          disabled={isPending}
          onCheckedChange={(value) => runToggle("is_mature", value)}
        />
        <Label htmlFor="is_mature">Mature (18+)</Label>
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
