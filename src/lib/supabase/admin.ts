import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// service_role client — bypasses RLS entirely. Only for auth.admin.* operations (list/ban/delete
// users) inside Server Actions/Route Handlers. Never import this from a Client Component.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
