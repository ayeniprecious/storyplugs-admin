import Image from "next/image";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-mark.png"
      alt="StoryPlugs"
      width={64}
      height={64}
      className={cn("size-8 shrink-0 object-contain", className)}
    />
  );
}
