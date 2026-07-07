"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { deleteReflection, setReflectionStatus } from "@/app/(dashboard)/reflections/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContentStatus } from "@/lib/database.types";

const STATUS_OPTIONS: ContentStatus[] = ["draft", "published", "archived"];

export function ReflectionRowActions({ id, status }: { id: string; status: ContentStatus }) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(value: string | null) {
    if (!value) return;
    startTransition(async () => {
      const result = await setReflectionStatus(id, value as "draft" | "published" | "archived");
      if (result.error) toast.error(result.error);
      else toast.success("Status updated.");
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteReflection(id);
      if (result.error) toast.error(result.error);
      else toast.success("Reflection deleted.");
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
        <SelectTrigger size="sm" className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
          Delete
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this reflection?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
