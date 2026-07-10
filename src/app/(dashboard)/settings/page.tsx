import { LogoUploader } from "@/app/(dashboard)/settings/logo-uploader";
import { SettingsForm } from "@/app/(dashboard)/settings/settings-form";
import type { AppSetting } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("*");
  const settings = new Map((data as AppSetting[] | null)?.map((s) => [s.key, s.value]) ?? []);

  const appName = (settings.get("app_name") as string) ?? "";
  const logoUrl = (settings.get("logo_url") as string | null) ?? null;
  const privacyPolicy = (settings.get("privacy_policy") as string) ?? "";
  const termsOfService = (settings.get("terms_of_service") as string) ?? "";

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <LogoUploader initialUrl={logoUrl} />
      <SettingsForm
        key={`${appName}|${privacyPolicy}|${termsOfService}`}
        appName={appName}
        privacyPolicy={privacyPolicy}
        termsOfService={termsOfService}
      />
    </div>
  );
}
