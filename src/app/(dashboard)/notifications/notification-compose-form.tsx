"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { sendNotification } from "@/app/(dashboard)/notifications/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface UserOption {
  id: string;
  label: string;
}

interface StoryOption {
  id: string;
  title: string;
  category: string;
}

export function NotificationComposeForm({
  users,
  stories,
}: {
  users: UserOption[];
  stories: StoryOption[];
}) {
  const [target, setTarget] = useState<"all" | "selected">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [storyQuery, setStoryQuery] = useState("");
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const filteredUsers = useMemo(
    () => users.filter((u) => u.label.toLowerCase().includes(userQuery.toLowerCase())),
    [users, userQuery]
  );

  const filteredStories = useMemo(
    () => stories.filter((s) => s.title.toLowerCase().includes(storyQuery.toLowerCase())),
    [stories, storyQuery]
  );
  const selectedStories = useMemo(
    () =>
      selectedStoryIds
        .map((id) => stories.find((s) => s.id === id))
        .filter((s): s is StoryOption => !!s),
    [selectedStoryIds, stories]
  );

  function toggleUser(id: string, checked: boolean) {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((u) => u !== id)));
  }

  function toggleStory(id: string, checked: boolean) {
    setSelectedStoryIds((prev) => (checked ? [...prev, id] : prev.filter((s) => s !== id)));
  }

  function moveStory(index: number, direction: -1 | 1) {
    setSelectedStoryIds((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSubmit(formData: FormData) {
    formData.set("target", target);
    if (target === "selected") {
      selectedIds.forEach((id) => formData.append("target_user_ids", id));
    }
    selectedStoryIds.forEach((id) => formData.append("story_ids", id));

    startTransition(async () => {
      const result = await sendNotification(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Sent to ${result.recipientCount} user(s), ${result.pushSent} push notification(s).`);
        if (result.pushErrors && result.pushErrors.length > 0) {
          console.error("Push delivery errors:", result.pushErrors);
          toast.error(
            `${result.pushErrors.length} push(es) failed to deliver — see browser console for details.`
          );
        }
        formRef.current?.reset();
        setSelectedIds([]);
        setSelectedStoryIds([]);
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="body">Message</Label>
        <Textarea id="body" name="body" required rows={3} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="story_id">Link to story (optional)</Label>
        <Select name="story_id">
          <SelectTrigger id="story_id" className="w-full">
            <SelectValue placeholder="No story link" />
          </SelectTrigger>
          <SelectContent>
            {stories.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 rounded-md border p-3">
        <Label>Attach a list of stories ({selectedStoryIds.length} selected)</Label>
        <p className="text-xs text-muted-foreground">
          Independent of the single story link above — shown in the app as a ranked row of poster
          cards under the message. Leave empty for a plain text notification.
        </p>
        <Input
          placeholder="Search stories..."
          value={storyQuery}
          onChange={(e) => setStoryQuery(e.target.value)}
        />
        <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
          {filteredStories.map((story) => (
            <label
              key={story.id}
              className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted"
            >
              <Checkbox
                checked={selectedStoryIds.includes(story.id)}
                onCheckedChange={(checked) => toggleStory(story.id, checked === true)}
              />
              {story.title}
              <span className="text-xs text-muted-foreground">({story.category})</span>
            </label>
          ))}
        </div>

        {selectedStories.length > 0 && (
          <div className="mt-2 flex flex-col gap-1 border-t pt-2">
            <Label className="text-xs text-muted-foreground">Rank shown in the app</Label>
            {selectedStories.map((story, i) => (
              <div
                key={story.id}
                className="flex items-center justify-between gap-2 rounded-md bg-muted px-2 py-1 text-sm"
              >
                <span>
                  {i + 1}. {story.title}
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={i === 0}
                    onClick={() => moveStory(i, -1)}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={i === selectedStories.length - 1}
                    onClick={() => moveStory(i, 1)}
                  >
                    ↓
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Send to</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={target === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTarget("all")}
          >
            All Users
          </Button>
          <Button
            type="button"
            variant={target === "selected" ? "default" : "outline"}
            size="sm"
            onClick={() => setTarget("selected")}
          >
            Specific Users ({selectedIds.length})
          </Button>
        </div>
      </div>

      {target === "selected" && (
        <div className="flex flex-col gap-2 rounded-md border p-3">
          <Input
            placeholder="Search users..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
          />
          <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
            {filteredUsers.map((user) => (
              <label key={user.id} className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted">
                <Checkbox
                  checked={selectedIds.includes(user.id)}
                  onCheckedChange={(checked) => toggleUser(user.id, checked === true)}
                />
                {user.label}
              </label>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Sending..." : "Send Notification"}
      </Button>
    </form>
  );
}
