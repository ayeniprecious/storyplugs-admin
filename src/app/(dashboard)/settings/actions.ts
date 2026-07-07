"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/require-admin";
import { createClient } from "@/lib/supabase/server";

export async function updateSetting(key: string, value: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("app_settings")
    .update({ value })
    .eq("key", key);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { error: null };
}

export async function updateTextSettings(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const updates = [
    { key: "app_name", value: String(formData.get("app_name") ?? "") },
    { key: "privacy_policy", value: String(formData.get("privacy_policy") ?? "") },
    { key: "terms_of_service", value: String(formData.get("terms_of_service") ?? "") },
  ];

  for (const { key, value } of updates) {
    const { error } = await supabase.from("app_settings").update({ value }).eq("key", key);
    if (error) return { error: error.message };
  }

  revalidatePath("/settings");
  return { error: null };
}
