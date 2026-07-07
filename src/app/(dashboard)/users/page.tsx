import { Users2 } from "lucide-react";

import { UserRowActions } from "@/app/(dashboard)/users/user-row-actions";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Profile } from "@/lib/database.types";
import { createAdminClient } from "@/lib/supabase/admin";

interface AdminUserRow {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  bannedUntil: string | null;
  profile: Profile | null;
}

async function getUsers(query: string): Promise<AdminUserRow[]> {
  const admin = createAdminClient();

  const { data: usersPage, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error || !usersPage) return [];

  const { data: profiles } = await admin
    .from("profiles")
    .select("*")
    .in(
      "id",
      usersPage.users.map((u) => u.id)
    );
  const profileById = new Map((profiles as Profile[] | null)?.map((p) => [p.id, p]) ?? []);

  let rows: AdminUserRow[] = usersPage.users.map((u) => ({
    id: u.id,
    email: u.email ?? null,
    createdAt: u.created_at,
    lastSignInAt: u.last_sign_in_at ?? null,
    bannedUntil: u.banned_until ?? null,
    profile: profileById.get(u.id) ?? null,
  }));

  if (query.trim()) {
    const q = query.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.email?.toLowerCase().includes(q) || r.profile?.display_name?.toLowerCase().includes(q)
    );
  }

  return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function isBanned(bannedUntil: string | null) {
  return !!bannedUntil && new Date(bannedUntil).getTime() > Date.now();
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const users = await getUsers(q);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">{users.length} total</p>
      </div>

      <form className="max-w-sm">
        <Input name="q" placeholder="Search by email or name" defaultValue={q} />
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={Users2}
                    title="No users found"
                    description="Try a different search term."
                  />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const banned = isBanned(user.bannedUntil);
                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.profile?.display_name ?? "—"}</TableCell>
                    <TableCell>{user.email ?? "—"}</TableCell>
                    <TableCell>{user.profile?.gender ?? "not collected"}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={banned ? "destructive" : "secondary"}>
                        {banned ? "Suspended" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <UserRowActions userId={user.id} banned={banned} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
