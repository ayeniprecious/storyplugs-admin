import {
  BookOpen,
  Flag,
  Heart,
  MessageSquare,
  TrendingUp,
  Users2,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

async function getCounts() {
  const supabase = await createClient();

  const [users, stories, publishedStories, reads, likes, comments, pendingReports] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("stories").select("*", { count: "exact", head: true }),
      supabase
        .from("stories")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase.from("story_views").select("*", { count: "exact", head: true }),
      supabase.from("favorites").select("*", { count: "exact", head: true }),
      supabase.from("comments").select("*", { count: "exact", head: true }),
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  return {
    users: users.count ?? 0,
    stories: stories.count ?? 0,
    publishedStories: publishedStories.count ?? 0,
    reads: reads.count ?? 0,
    likes: likes.count ?? 0,
    comments: comments.count ?? 0,
    pendingReports: pendingReports.count ?? 0,
  };
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  alert,
}: {
  label: string;
  value: number;
  hint?: string;
  icon: LucideIcon;
  alert?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            alert ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value.toLocaleString()}</p>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const counts = await getCounts();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Users" value={counts.users} icon={Users2} />
        <StatCard
          label="Total Stories"
          value={counts.stories}
          hint={`${counts.publishedStories} published`}
          icon={BookOpen}
        />
        <StatCard label="Reads" value={counts.reads} icon={TrendingUp} />
        <StatCard label="Likes" value={counts.likes} icon={Heart} />
        <StatCard label="Comments" value={counts.comments} icon={MessageSquare} />
        <StatCard
          label="Pending Reports"
          value={counts.pendingReports}
          icon={Flag}
          alert={counts.pendingReports > 0}
        />
      </div>
    </div>
  );
}
