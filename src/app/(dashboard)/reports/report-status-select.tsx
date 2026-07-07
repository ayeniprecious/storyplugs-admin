"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { setReportStatus } from "@/app/(dashboard)/reports/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportStatus } from "@/lib/database.types";

const STATUS_OPTIONS: ReportStatus[] = ["pending", "reviewed", "dismissed", "actioned"];

export function ReportStatusSelect({ id, status }: { id: string; status: ReportStatus }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string | null) {
    if (!value) return;
    startTransition(async () => {
      const result = await setReportStatus(id, value as ReportStatus);
      if (result.error) toast.error(result.error);
      else toast.success("Report updated.");
    });
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
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
  );
}
