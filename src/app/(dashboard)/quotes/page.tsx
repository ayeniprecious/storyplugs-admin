import { QuoteFormDialog } from "@/app/(dashboard)/quotes/quote-form-dialog";
import { QuoteRowActions } from "@/app/(dashboard)/quotes/quote-row-actions";
import { Button } from "@/components/ui/button";
import { ContentStatusBadge } from "@/components/content-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Quote } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export default async function QuotesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
  const quotes = (data as Quote[] | null) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quotes</h1>
        <QuoteFormDialog trigger={<Button>New Quote</Button>} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No quotes yet.
                </TableCell>
              </TableRow>
            ) : (
              quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="max-w-md truncate">{quote.text}</TableCell>
                  <TableCell>{quote.author ?? "—"}</TableCell>
                  <TableCell>
                    <ContentStatusBadge status={quote.status} />
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <QuoteFormDialog
                      quote={quote}
                      trigger={
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      }
                    />
                    <QuoteRowActions id={quote.id} status={quote.status} />
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
