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

export function NotificationComposeForm({
  users,
  stories,
}: {
  users: UserOption[];
  stories: { id: string; title: string }[];
}) {
  const [target, setTarget] = useState<"all" | "selected">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const filteredUsers = useMemo(
    () => users.filter((u) => u.label.toLowerCase().includes(userQuery.toLowerCase())),
    [users, userQuery]
  );

  function toggleUser(id: string, checked: boolean) {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((u) => u !== id)));
  }

  function handleSubmit(formData: FormData) {
    formData.set("target", target);
    if (target === "selected") {
      selectedIds.forEach((id) => formData.append("target_user_ids", id));
    }

    startTransition(async () => {
      const result = await sendNotification(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Sent to ${result.recipientCount} user(s), ${result.pushSent} push notification(s).`);
        formRef.current?.reset();
        setSelectedIds([]);
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
