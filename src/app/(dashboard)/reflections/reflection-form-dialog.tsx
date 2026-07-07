"use client";

import { useState } from "react";
import { toast } from "sonner";

import { createReflection, updateReflection } from "@/app/(dashboard)/reflections/actions";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Reflection } from "@/lib/database.types";

export function ReflectionFormDialog({
  reflection,
  trigger,
}: {
  reflection?: Reflection;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = !!reflection;

  async function action(formData: FormData) {
    const result = isEdit
      ? await updateReflection(reflection!.id, formData)
      : await createReflection(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(isEdit ? "Reflection updated." : "Reflection created.");
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Reflection" : "New Reflection"}</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="text">Reflection</Label>
            <Textarea id="text" name="text" required rows={4} defaultValue={reflection?.text} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">{isEdit ? "Save" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
