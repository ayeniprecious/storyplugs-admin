import { Flag } from "lucide-react";
import Link from "next/link";

import { ReportStatusSelect } from "@/app/(dashboard)/reports/report-status-select";
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
import type { Report, Story } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (reports as Report[] | null) ?? [];
  const storyIds = rows.filter((r) => r.target_type === "story").map((r) => r.target_id);
  const { data: stories } = storyIds.length
    ? await supabase.from("stories").select("id, title").in("id", storyIds)
    : { data: [] };
  const storyTitle = new Map((stories as Pick<Story, "id" | "title">[] | null)?.map((s) => [s.id, s.title]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">{rows.length} total</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Target</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState
                    icon={Flag}
                    title="No reports"
                    description="Reported stories, comments, and users will show up here."
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{report.target_type}</Badge>
                      {report.target_type === "story" ? (
                        <Link href={`/stories/${report.target_id}`} className="underline">
                          {storyTitle.get(report.target_id) ?? report.target_id}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">{report.target_id}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-sm truncate">{report.reason}</TableCell>
                  <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <ReportStatusSelect id={report.id} status={report.status} />
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
