"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  approveSubmission,
  rejectSubmission,
  setSubmissionVisibility,
} from "@/app/(dashboard)/submissions/actions";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { StorySubmission } from "@/lib/database.types";

export function SubmissionActions({ submission }: { submission: StorySubmission }) {
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");

  function handleApprove() {
    startTransition(async () => {
      const result = await approveSubmission(submission.id);
      if (result.error) toast.error(result.error);
      else toast.success("Submission approved.");
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectSubmission(submission.id, note.trim() || null);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Submission rejected.");
        setRejectOpen(false);
      }
    });
  }

  function handleVisibilityChange(checked: boolean) {
    startTransition(async () => {
      const result = await setSubmissionVisibility(submission.id, checked);
      if (result.error) toast.error(result.error);
    });
  }

  if (submission.status === "pending") {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleApprove} disabled={isPending}>
          Approve
        </Button>
        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogTrigger
            render={
              <Button size="sm" variant="outline" disabled={isPending}>
                Reject
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject submission</DialogTitle>
            </DialogHeader>
            <Textarea
              placeholder="Optional note for the submitter..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button variant="destructive" onClick={handleReject} disabled={isPending}>
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (submission.status === "approved") {
    return (
      <div className="flex items-center gap-2">
        <Switch
          checked={submission.is_visible}
          onCheckedChange={handleVisibilityChange}
          disabled={isPending}
        />
        <span className="text-sm text-muted-foreground">
          {submission.is_visible ? "Visible" : "Hidden"}
        </span>
      </div>
    );
  }

  return <span className="text-sm text-muted-foreground">{submission.admin_note || "No note"}</span>;
}
