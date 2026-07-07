import { DeleteCommentButton } from "@/app/(dashboard)/comments/delete-comment-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Comment, Profile, Story } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export default async function CommentsPage() {
  const supabase = await createClient();
  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (comments as Comment[] | null) ?? [];
  const storyIds = [...new Set(rows.map((c) => c.story_id))];
  const userIds = [...new Set(rows.map((c) => c.user_id))];

  const [{ data: stories }, { data: profiles }] = await Promise.all([
    storyIds.length
      ? supabase.from("stories").select("id, title").in("id", storyIds)
      : Promise.resolve({ data: [] }),
    userIds.length
      ? supabase.from("profiles").select("*").in("id", userIds)
      : Promise.resolve({ data: [] }),
  ]);

  const storyTitle = new Map((stories as Pick<Story, "id" | "title">[] | null)?.map((s) => [s.id, s.title]));
  const profileName = new Map((profiles as Profile[] | null)?.map((p) => [p.id, p.display_name]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Comments</h1>
        <p className="text-sm text-muted-foreground">{rows.length} total</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Comment</TableHead>
              <TableHead>Story</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No comments yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="max-w-md truncate">{comment.body}</TableCell>
                  <TableCell>{storyTitle.get(comment.story_id) ?? "—"}</TableCell>
                  <TableCell>{profileName.get(comment.user_id) ?? "—"}</TableCell>
                  <TableCell>{new Date(comment.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DeleteCommentButton id={comment.id} />
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
