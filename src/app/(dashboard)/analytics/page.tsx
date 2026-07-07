import { DailyChart } from "@/app/(dashboard)/analytics/daily-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";

const DAYS = 30;

function bucketByDay(dates: string[]) {
  const counts = new Map<string, number>();
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    counts.set(d.toISOString().slice(0, 10), 0);
  }
  for (const date of dates) {
    const key = date.slice(0, 10);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - DAYS);
  const sinceIso = since.toISOString();

  const [
    { data: newProfiles },
    { data: recentViews },
    { data: allViews },
    { data: stories },
    { data: allProfiles },
  ] = await Promise.all([
    supabase.from("profiles").select("created_at").gte("created_at", sinceIso),
    supabase.from("story_views").select("created_at").gte("created_at", sinceIso),
    supabase.from("story_views").select("story_id"),
    supabase.from("stories").select("id, title"),
    supabase.from("profiles").select("gender"),
  ]);

  const userGrowth = bucketByDay((newProfiles ?? []).map((p) => p.created_at));
  const readsOverTime = bucketByDay((recentViews ?? []).map((v) => v.created_at));

  const viewCounts = new Map<string, number>();
  for (const v of allViews ?? []) {
    viewCounts.set(v.story_id, (viewCounts.get(v.story_id) ?? 0) + 1);
  }
  const storyTitleById = new Map((stories ?? []).map((s) => [s.id, s.title]));
  const topStories = [...viewCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([storyId, count]) => ({ title: storyTitleById.get(storyId) ?? storyId, count }));

  const genderCounts = new Map<string, number>();
  for (const p of allProfiles ?? []) {
    const key = p.gender?.trim() || "Not collected";
    genderCounts.set(key, (genderCounts.get(key) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      <Card>
        <CardHeader>
          <CardTitle>User Growth (last {DAYS} days)</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyChart data={userGrowth} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Story Reads (last {DAYS} days)</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyChart data={readsOverTime} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Story</TableHead>
                  <TableHead className="text-right">Reads</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topStories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No reads yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  topStories.map((s) => (
                    <TableRow key={s.title}>
                      <TableCell className="max-w-xs truncate">{s.title}</TableCell>
                      <TableCell className="text-right">{s.count}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gender Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gender</TableHead>
                  <TableHead className="text-right">Users</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...genderCounts.entries()].map(([gender, count]) => (
                  <TableRow key={gender}>
                    <TableCell>{gender}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
