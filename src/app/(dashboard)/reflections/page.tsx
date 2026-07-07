import { Sparkles } from "lucide-react";

import { ReflectionFormDialog } from "@/app/(dashboard)/reflections/reflection-form-dialog";
import { ReflectionRowActions } from "@/app/(dashboard)/reflections/reflection-row-actions";
import { ContentStatusBadge } from "@/components/content-status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Reflection } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export default async function ReflectionsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reflections")
    .select("*")
    .order("created_at", { ascending: false });
  const reflections = (data as Reflection[] | null) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reflections</h1>
        <ReflectionFormDialog trigger={<Button>New Reflection</Button>} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reflection</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reflections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <EmptyState
                    icon={Sparkles}
                    title="No reflections yet"
                    description="Add your first reflection to get started."
                  />
                </TableCell>
              </TableRow>
            ) : (
              reflections.map((reflection) => (
                <TableRow key={reflection.id}>
                  <TableCell className="max-w-lg truncate">{reflection.text}</TableCell>
                  <TableCell>
                    <ContentStatusBadge status={reflection.status} />
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <ReflectionFormDialog
                      reflection={reflection}
                      trigger={
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      }
                    />
                    <ReflectionRowActions id={reflection.id} status={reflection.status} />
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
