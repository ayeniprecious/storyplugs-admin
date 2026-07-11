"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

// ~100 years — effectively permanent until explicitly unbanned.
const PERMANENT_BAN_DURATION = "876000h";

export async function suspendUser(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: PERMANENT_BAN_DURATION,
  });
  if (error) return { error: error.message };
  revalidatePath("/users");
  return { error: null };
}

export async function unbanUser(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: "none" });
  if (error) return { error: error.message };
  revalidatePath("/users");
  return { error: null };
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  revalidatePath("/users");
  return { error: null };
}

export async function setPremium(userId: string, isPremium: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ is_premium: isPremium }).eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/users");
  return { error: null };
}
