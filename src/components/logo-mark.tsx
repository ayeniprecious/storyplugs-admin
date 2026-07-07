import { BookHeart } from "lucide-react";

import { cn } from "@/lib/utils";

export function LogoMark({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className
      )}
    >
      <BookHeart className={cn("size-4", iconClassName)} />
    </div>
  );
}
