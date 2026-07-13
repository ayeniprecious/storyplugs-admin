"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ANCHORS, STYLES } from "@/app/(dashboard)/sections/constants";
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
import { Switch } from "@/components/ui/switch";
import type { CuratedSection, CuratedSectionPage, CuratedSectionStyle } from "@/lib/database.types";

interface StoryOption {
  id: string;
  title: string;
  category: string;
}

export function SectionForm({
  section,
  initialStoryIds,
  stories,
  formAction,
  submitLabel,
}: {
  section?: CuratedSection;
  initialStoryIds?: string[];
  stories: StoryOption[];
  formAction: (formData: FormData) => Promise<{ error: string | null }>;
  submitLabel: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [targetPage, setTargetPage] = useState<CuratedSectionPage>(section?.target_page ?? "home");
  const [anchor, setAnchor] = useState(section?.anchor ?? ANCHORS.home[0].value);
  const [displayStyle, setDisplayStyle] = useState<CuratedSectionStyle>(section?.display_style ?? "poster");
  const [isActive, setIsActive] = useState(section?.is_active ?? true);
  const [storyQuery, setStoryQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(initialStoryIds ?? []);
  const [isPending, startTransition] = useTransition();

  const filteredStories = useMemo(
    () => stories.filter((s) => s.title.toLowerCase().includes(storyQuery.toLowerCase())),
    [stories, storyQuery]
  );
  const selectedStories = useMemo(
    () =>
      selectedIds
        .map((id) => stories.find((s) => s.id === id))
        .filter((s): s is StoryOption => !!s),
    [selectedIds, stories]
  );

  function handlePageChange(value: CuratedSectionPage) {
    setTargetPage(value);
    setAnchor(ANCHORS[value][0].value);
  }

  function toggleStory(id: string, checked: boolean) {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((s) => s !== id)));
  }

  function moveStory(index: number, direction: -1 | 1) {
    setSelectedIds((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSubmit(formData: FormData) {
    formData.set("target_page", targetPage);
    formData.set("anchor", anchor);
    formData.set("display_style", displayStyle);
    formData.set("is_active", isActive ? "true" : "false");
    selectedIds.forEach((id) => formData.append("story_ids", id));

    startTransition(async () => {
      const result = await formAction(formData);
      if (result.error) toast.error(result.error);
      else router.push("/sections");
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={section?.title} />
        <p className="text-xs text-muted-foreground">Shown as the row&apos;s heading in the app.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="target_page">Page</Label>
          <Select value={targetPage} onValueChange={(v) => handlePageChange(v as CuratedSectionPage)}>
            <SelectTrigger id="target_page" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="search">Search</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="anchor">Position</Label>
          <Select value={anchor} onValueChange={(v) => v && setAnchor(v)}>
            <SelectTrigger id="anchor" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ANCHORS[targetPage].map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="display_style">Display style</Label>
        <Select value={displayStyle} onValueChange={(v) => setDisplayStyle(v as CuratedSectionStyle)}>
          <SelectTrigger id="display_style" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STYLES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {STYLES.find((s) => s.value === displayStyle)?.description}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex flex-col gap-2 rounded-md border p-3">
        <Label>Stories ({selectedIds.length} selected)</Label>
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
                checked={selectedIds.includes(story.id)}
                onCheckedChange={(checked) => toggleStory(story.id, checked === true)}
              />
              {story.title}
              <span className="text-xs text-muted-foreground">({story.category})</span>
            </label>
          ))}
        </div>

        {selectedStories.length > 0 && (
          <div className="mt-2 flex flex-col gap-1 border-t pt-2">
            <Label className="text-xs text-muted-foreground">Order shown in the app</Label>
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

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
