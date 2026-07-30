import { FileText } from "lucide-react";

import { SubmissionActions } from "@/app/(dashboard)/submissions/submission-actions";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StorySubmission } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

const STATUS_VARIANT: Record<StorySubmission["status"], "warning" | "success" | "destructive"> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
};

export default async function SubmissionsPage() {
  const supabase = await createClient();
  const { data: submissions } = await supabase
    .from("story_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (submissions as StorySubmission[] | null) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Submissions</h1>
        <p className="text-sm text-muted-foreground">{rows.length} total</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={FileText}
                    title="No submissions"
                    description="Stories submitted by Premium users will show up here for review."
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="max-w-xs">
                    <p className="truncate font-medium">{submission.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{submission.body}</p>
                  </TableCell>
                  <TableCell>{submission.author_name}</TableCell>
                  <TableCell>{submission.category ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[submission.status]}>{submission.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <SubmissionActions submission={submission} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
