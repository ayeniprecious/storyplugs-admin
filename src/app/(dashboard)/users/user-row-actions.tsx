"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteUser, suspendUser, unbanUser } from "@/app/(dashboard)/users/actions";
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

export function UserRowActions({ userId, banned }: { userId: string; banned: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [openDialog, setOpenDialog] = useState<"suspend" | "delete" | null>(null);

  function runSuspendToggle() {
    startTransition(async () => {
      const result = banned ? await unbanUser(userId) : await suspendUser(userId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(banned ? "User unbanned." : "User suspended.");
        setOpenDialog(null);
      }
    });
  }

  function runDelete() {
    startTransition(async () => {
      const result = await deleteUser(userId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User deleted.");
        setOpenDialog(null);
      }
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <AlertDialog
        open={openDialog === "suspend"}
        onOpenChange={(open) => setOpenDialog(open ? "suspend" : null)}
      >
        <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
          {banned ? "Unban" : "Suspend"}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{banned ? "Unban this user?" : "Suspend this user?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {banned
                ? "They will be able to sign in again immediately."
                : "They will be immediately signed out and unable to sign in until unbanned."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={runSuspendToggle}>
              {banned ? "Unban" : "Suspend"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={openDialog === "delete"}
        onOpenChange={(open) => setOpenDialog(open ? "delete" : null)}
      >
        <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
          Delete
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes their account and all associated data (favorites, comments, progress).
              This cannot be undone.
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
