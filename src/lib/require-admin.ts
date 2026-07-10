import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { AdminRow } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

// Server Component/Action guard: confirms a logged-in session AND a matching `admins` row
// (RLS already blocks non-admins from every admin table, but we want a clean redirect instead
// of a page full of empty/errored queries).
export async function requireAdmin(): Promise<{ userId: string; email: string | null; admin: AdminRow }> {
  const supabase = await createClient();

  // proxy.ts already validated the session for this request via a getUser() round trip to
  // Supabase Auth and forwarded the result -- reuse it instead of paying for a second one.
  // Falls back to a live check if the header is missing (e.g. middleware didn't run).
  const headerStore = await headers();
  const verifiedUserId = headerStore.get("x-verified-user-id");
  const verifiedUserEmail = headerStore.get("x-verified-user-email");

  let user: { id: string; email: string | null } | null = verifiedUserId
    ? { id: verifiedUserId, email: verifiedUserEmail || null }
    : null;

  if (!user) {
    const {
      data: { user: freshUser },
    } = await supabase.auth.getUser();
    user = freshUser ? { id: freshUser.id, email: freshUser.email ?? null } : null;
  }

  if (!user) {
    redirect("/login");
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/login?error=not_admin");
  }

  return { userId: user.id, email: user.email ?? null, admin: admin as AdminRow };
}
