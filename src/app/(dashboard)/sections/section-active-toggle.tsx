"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { toggleSectionActive } from "@/app/(dashboard)/sections/actions";
import { Switch } from "@/components/ui/switch";

export function SectionActiveToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: boolean) {
    startTransition(async () => {
      const result = await toggleSectionActive(id, value);
      if (result.error) toast.error(result.error);
    });
  }

  return <Switch checked={isActive} disabled={isPending} onCheckedChange={handleChange} />;
}
