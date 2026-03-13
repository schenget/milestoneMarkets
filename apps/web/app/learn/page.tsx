import Link from "next/link";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface Lesson {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  readingTimeMin: number;
  free: boolean;
}

async function getLessons(): Promise<Lesson[]> {
  try {
    const res = await fetch(`${API}/api/lessons`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function groupByCategory(lessons: Lesson[]) {
  return lessons.reduce((acc, l) => {
    (acc[l.category] ??= []).push(l);
    return acc;
  }, {} as Record<string, Lesson[]>);
}

export default async function LearnPage() {
  const lessons = await getLessons();
  const grouped = groupByCategory(lessons);

  return (
    <main className="container py-8">
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Financial Education</h1>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
        Structured lessons for beginner and intermediate investors across African markets.
      </p>

      {lessons.length === 0 && (
        <p className="mt-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">Lessons are loading. Ensure API is running.</p>
      )}

      <div className="mt-6 space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-3 text-lg font-semibold">{category}</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((lesson) => (
                <Link key={lesson.slug} href={`/learn/${lesson.slug}`}>
                  <Card className="h-full transition hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-base">{lesson.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{lesson.readingTimeMin} min read</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="capitalize">{lesson.difficulty}</Badge>
                        <Badge variant={lesson.free ? "secondary" : "default"}>{lesson.free ? "Free" : "Premium"}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
