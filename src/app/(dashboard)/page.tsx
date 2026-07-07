import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default async function DashboardPage() {
  const counts = await getCounts();

  const cards = [
    { label: "Total Users", value: counts.users },
    { label: "Total Stories", value: counts.stories, hint: `${counts.publishedStories} published` },
    { label: "Reads", value: counts.reads },
    { label: "Likes", value: counts.likes },
    { label: "Comments", value: counts.comments },
    { label: "Pending Reports", value: counts.pendingReports },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{card.value.toLocaleString()}</p>
              {card.hint && <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
