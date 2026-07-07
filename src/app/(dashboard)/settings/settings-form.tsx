"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { updateTextSettings } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SettingsForm({
  appName,
  privacyPolicy,
  termsOfService,
}: {
  appName: string;
  privacyPolicy: string;
  termsOfService: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateTextSettings(formData);
      if (result.error) toast.error(result.error);
      else toast.success("Settings saved.");
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="app_name">App name</Label>
        <Input id="app_name" name="app_name" defaultValue={appName} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="privacy_policy">Privacy policy</Label>
        <Textarea id="privacy_policy" name="privacy_policy" rows={8} defaultValue={privacyPolicy} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="terms_of_service">Terms of service</Label>
        <Textarea
          id="terms_of_service"
          name="terms_of_service"
          rows={8}
          defaultValue={termsOfService}
        />
      </div>
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
