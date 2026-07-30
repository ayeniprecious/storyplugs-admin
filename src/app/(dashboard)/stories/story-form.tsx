"use client";

import { useActionState, useRef, useState } from "react";

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
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import type { Category, Story, Tag } from "@/lib/database.types";

const SHORT_STORY_DEFAULT_CATEGORY = "kindness";

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
  const [isShortStory, setIsShortStory] = useState(story?.is_short_story ?? false);
  const [category, setCategory] = useState(story?.category ?? categories[0]?.slug ?? "");
  // Only new stories get the auto-default -- editing an existing story
  // should never silently change its category out from under an admin.
  const [categoryTouched, setCategoryTouched] = useState(!!story);
  const [imageUrl, setImageUrl] = useState(story?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  function handleShortStoryChange(checked: boolean) {
    setIsShortStory(checked);
    if (checked && !categoryTouched && categories.some((c) => c.slug === SHORT_STORY_DEFAULT_CATEGORY)) {
      setCategory(SHORT_STORY_DEFAULT_CATEGORY);
    }
  }

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset the input so picking the same file again still fires onChange.
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      setImageUrl(await uploadImageToCloudinary(file));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={story?.title} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="author_name">Author</Label>
        <Input
          id="author_name"
          name="author_name"
          placeholder="e.g. Maya Alvarez"
          defaultValue={story?.author_name ?? "StoryPlugs"}
        />
        <p className="text-xs text-muted-foreground">
          The writer's byline, shown on the story&apos;s book-cover card. Defaults to
          StoryPlugs -- change it if this story belongs to a specific writer.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-md border p-3">
        <input
          id="is_short_story"
          name="is_short_story"
          type="checkbox"
          checked={isShortStory}
          onChange={(e) => handleShortStoryChange(e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="is_short_story">Short Story</Label>
          <p className="text-xs text-muted-foreground">
            Shows with a real cover image (below) instead of a color card, appears in Home&apos;s
            Short Stories row, and is eligible to be picked as Story of the Day. Defaults new
            stories to the Kindness category -- change it below if this one belongs elsewhere.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category">Category</Label>
        <Select
          name="category"
          value={category}
          onValueChange={(value) => {
            if (!value) return;
            setCategory(value);
            setCategoryTouched(true);
          }}
        >
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="image_url">Image URL{isShortStory && " (required)"}</Label>
          <div className="flex gap-2">
            <Input
              id="image_url"
              name="image_url"
              required={isShortStory}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... or upload a file"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => imageFileInputRef.current?.click()}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
            <input
              ref={imageFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />
          </div>
          {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
          {isShortStory && (
            <p className="text-xs text-muted-foreground">
              Rendered as this short story&apos;s cover, in place of the color card. Paste a URL, or
              click Upload to send a picture to Cloudinary and fill this in automatically.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="audio_url">Audio URL</Label>
          <Input id="audio_url" name="audio_url" defaultValue={story?.audio_url ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cover_color">Cover color</Label>
          <Input
            id="cover_color"
            name="cover_color"
            type="color"
            className="h-9 w-full p-1"
            defaultValue={story?.cover_color ?? "#5C0F0F"}
          />
          <p className="text-xs text-muted-foreground">
            Used as the book-cover background on category rows when there&apos;s no image.
          </p>
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
