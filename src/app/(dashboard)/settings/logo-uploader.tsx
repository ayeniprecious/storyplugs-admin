"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateSetting } from "@/app/(dashboard)/settings/actions";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function LogoUploader({ initialUrl }: { initialUrl: string | null }) {
  const [logoUrl, setLogoUrl] = useState(initialUrl);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      const supabase = createClient();
      const path = `logo/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("app-assets")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        toast.error(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("app-assets").getPublicUrl(path);
      const result = await updateSetting("logo_url", data.publicUrl);
      if (result.error) {
        toast.error(result.error);
      } else {
        setLogoUrl(data.publicUrl);
        toast.success("Logo updated.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="logo">Logo</Label>
      {logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="App logo" className="h-16 w-16 rounded-md object-cover" />
      )}
      <input
        id="logo"
        type="file"
        accept="image/*"
        disabled={isPending}
        onChange={handleFileChange}
        className="text-sm"
      />
      {isPending && <p className="text-xs text-muted-foreground">Uploading...</p>}
    </div>
  );
}
