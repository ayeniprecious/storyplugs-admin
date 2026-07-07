import { Badge } from "@/components/ui/badge";
import type { ContentStatus } from "@/lib/database.types";

const STATUS_VARIANT: Record<ContentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  pending_review: "secondary",
  approved: "secondary",
  published: "default",
  archived: "destructive",
};

const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  approved: "Approved",
  published: "Published",
  archived: "Archived",
};

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
