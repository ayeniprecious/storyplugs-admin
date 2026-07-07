"use client";

import { useState } from "react";
import { toast } from "sonner";

import { createQuote, updateQuote } from "@/app/(dashboard)/quotes/actions";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Quote } from "@/lib/database.types";

export function QuoteFormDialog({ quote, trigger }: { quote?: Quote; trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const isEdit = !!quote;

  async function action(formData: FormData) {
    const result = isEdit ? await updateQuote(quote!.id, formData) : await createQuote(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(isEdit ? "Quote updated." : "Quote created.");
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Quote" : "New Quote"}</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="text">Quote</Label>
            <Textarea id="text" name="text" required rows={4} defaultValue={quote?.text} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="author">Author (optional)</Label>
            <Input id="author" name="author" defaultValue={quote?.author ?? ""} />
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
