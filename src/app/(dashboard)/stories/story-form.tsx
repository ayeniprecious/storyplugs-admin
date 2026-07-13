"use client";

import { useActionState } from "react";

import type { StoryFormState } from "@/app/(dashboard)/stories/actions";
import { Button } from "@/components/ui/button";
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
import type { Category, Story, Tag } from "@/lib/database.types";

export function StoryForm({
  story,
  categories,
  tags,
  initialTags,
  formAction,
  submitLabel,
}: {
  story?: Story;
  categories: Category[];
  tags: Tag[];
  initialTags: string[];
  formAction: (state: StoryFormState, formData: FormData) => Promise<StoryFormState>;
  submitLabel: string;
}) {
  const [state, action, pending] = useActionState<StoryFormState, FormData>(formAction, {
    error: null,
  });

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={story?.title} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category">Category</Label>
        <Select name="category" defaultValue={story?.category ?? categories[0]?.slug}>
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="body">
          {story ? "Body / synopsis" : "Body"}
        </Label>
        <Textarea id="body" name="body" required rows={8} defaultValue={story?.body} />
        <p className="text-xs text-muted-foreground">
          If this story uses chapters, this becomes the short synopsis shown on the preview page.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input id="image_url" name="image_url" defaultValue={story?.image_url ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="audio_url">Audio URL</Label>
          <Input id="audio_url" name="audio_url" defaultValue={story?.audio_url ?? ""} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="reflection_question">Reflection question</Label>
        <Textarea
          id="reflection_question"
          name="reflection_question"
          rows={2}
          defaultValue={story?.reflection_question ?? ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="daily_lesson">Daily lesson</Label>
        <Textarea
          id="daily_lesson"
          name="daily_lesson"
          rows={2}
          defaultValue={story?.daily_lesson ?? ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          list="tag-suggestions"
          placeholder="e.g. gifting, helpful, mercy, loyalty, favour"
          defaultValue={initialTags.join(", ")}
        />
        <datalist id="tag-suggestions">
          {tags.map((tag) => (
            <option key={tag.slug} value={tag.name} />
          ))}
        </datalist>
        <p className="text-xs text-muted-foreground">
          Comma-separated. Finer-grained than category — used to sharpen mood-based picks and
          preference matching. Start typing to see existing tags, or add new ones freely.
        </p>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
