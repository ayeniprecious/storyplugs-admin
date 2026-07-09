"use client";

import { useState } from "react";
import { toast } from "sonner";

import { updateNotification } from "@/app/(dashboard)/notifications/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AppNotification } from "@/lib/database.types";

export function NotificationEditDialog({
  notification,
  stories,
  trigger,
}: {
  notification: AppNotification;
  stories: { id: string; title: string }[];
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [storyId, setStoryId] = useState(notification.story_id ?? "");

  async function action(formData: FormData) {
    formData.set("story_id", storyId);
    const result = await updateNotification(notification.id, formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Notification updated.");
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Notification</DialogTitle>
          <DialogDescription>
            Corrects the stored record — it does not resend the push notification.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required defaultValue={notification.title} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="body">Message</Label>
            <Textarea id="body" name="body" required rows={3} defaultValue={notification.body} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="story_id">Link to story (optional)</Label>
            <Select value={storyId} onValueChange={(value) => setStoryId(value ?? "")}>
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
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
