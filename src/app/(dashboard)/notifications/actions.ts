"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/require-admin";
import { createClient } from "@/lib/supabase/server";

export async function sendNotification(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const target = String(formData.get("target") ?? "all");
  const storyId = String(formData.get("story_id") ?? "").trim() || undefined;
  const targetUserIds = formData.getAll("target_user_ids").map(String);

  if (!title || !body) return { error: "Title and body are required." };
  if (target === "selected" && targetUserIds.length === 0) {
    return { error: "Select at least one user." };
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "Session expired — please sign in again." };

  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      title,
      body,
      target,
      targetUserIds: target === "selected" ? targetUserIds : undefined,
      storyId,
    }),
  });

  const result = await res.json().catch(() => ({ error: "Invalid response from server." }));
  if (!res.ok) return { error: result.error ?? "Failed to send notification." };

  revalidatePath("/notifications");
  return { error: null, recipientCount: result.recipientCount, pushSent: result.pushSent };
}

export async function updateNotification(id: string, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const storyId = String(formData.get("story_id") ?? "").trim() || null;

  if (!title || !body) return { error: "Title and body are required." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .update({ title, body, story_id: storyId })
    .eq("id", id)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: "Update was blocked — no matching notification or insufficient permissions." };
  }

  revalidatePath("/notifications");
  return { error: null };
}

export async function deleteNotification(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.from("notifications").delete().eq("id", id).select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: "Delete was blocked — no matching notification or insufficient permissions." };
  }
  revalidatePath("/notifications");
  return { error: null };
}
