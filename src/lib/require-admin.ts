import "server-only";

import { redirect } from "next/navigation";

import type { AdminRow } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

// Server Component/Action guard: confirms a logged-in session AND a matching `admins` row
// (RLS already blocks non-admins from every admin table, but we want a clean redirect instead
// of a page full of empty/errored queries).
export async function requireAdmin(): Promise<{ userId: string; email: string | null; admin: AdminRow }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
