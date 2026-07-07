import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="max-w-xs text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
