import { NotificationComposeForm } from "@/app/(dashboard)/notifications/notification-compose-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AppNotification, Profile, Story } from "@/lib/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function getUserOptions() {
  const admin = createAdminClient();
  const { data: usersPage } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (!usersPage) return [];

  const { data: profiles } = await admin
    .from("profiles")
    .select("*")
    .in("id", usersPage.users.map((u) => u.id));
  const nameById = new Map((profiles as Profile[] | null)?.map((p) => [p.id, p.display_name]) ?? []);

  return usersPage.users.map((u) => ({
    id: u.id,
    label: nameById.get(u.id) ? `${nameById.get(u.id)} (${u.email})` : u.email ?? u.id,
  }));
}

export default async function NotificationsPage() {
  const supabase = await createClient();

  const [users, { data: stories }, { data: notifications }] = await Promise.all([
    getUserOptions(),
    supabase.from("stories").select("id, title").eq("status", "published").order("title"),
    supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-6 text-2xl font-semibold">Notifications</h1>
        <div className="max-w-xl">
          <NotificationComposeForm
            users={users}
            stories={(stories as Pick<Story, "id" | "title">[] | null) ?? []}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">History</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {((notifications as AppNotification[] | null) ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No notifications sent yet.
                  </TableCell>
                </TableRow>
              ) : (
                (notifications as AppNotification[]).map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>{n.title}</TableCell>
                    <TableCell className="max-w-sm truncate">{n.body}</TableCell>
                    <TableCell>{n.target_type}</TableCell>
                    <TableCell>{new Date(n.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
