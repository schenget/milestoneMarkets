"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface Lesson {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  readingTimeMin: number;
  free: boolean;
  content: string;
}

export default function LessonPage({ params }: { params: { slug: string } }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/lessons/${params.slug}`)
      .then((r) => r.json())
      .then(setLesson)
      .catch(() => setError("Lesson not found."))
      .finally(() => setLoading(false));

    try {
      const stored = JSON.parse(localStorage.getItem("mm_completed") ?? "[]");
      if (stored.includes(params.slug)) setCompleted(true);
    } catch {
      setCompleted(false);
    }
  }, [params.slug]);

  const markComplete = async () => {
    const token = localStorage.getItem("mm_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setMarking(true);
    try {
      await fetch(`${API}/api/lessons/${params.slug}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompleted(true);
      const stored = JSON.parse(localStorage.getItem("mm_completed") ?? "[]");
      if (!stored.includes(params.slug)) {
        localStorage.setItem("mm_completed", JSON.stringify([...stored, params.slug]));
      }
    } catch {
      setError("Unable to mark lesson complete.");
    }
    setMarking(false);
  };

  if (loading) return <main className="container py-8 text-sm text-muted-foreground">Loading...</main>;
  if (error || !lesson) return <main className="container py-8 text-sm text-rose-700">{error || "Lesson not found."}</main>;

  return (
    <main className="container py-8">
      <Link href="/learn" className="text-sm font-medium text-muted-foreground">Back to lessons</Link>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="outline" className="capitalize">{lesson.difficulty}</Badge>
        <Badge variant={lesson.free ? "secondary" : "default"}>{lesson.free ? "Free" : "Premium"}</Badge>
        <span className="text-sm text-muted-foreground">{lesson.readingTimeMin} min read</span>
      </div>

      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">{lesson.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{lesson.category}</p>

      <div className="prose prose-slate mt-6 max-w-none text-sm leading-7">
        {lesson.content.split("\n").map((para, i) => (para.trim() ? <p key={i}>{para}</p> : null))}
      </div>

      <Card className="mt-8 border-border/70">
        <CardContent className="pt-6">
          {completed ? (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">You have completed this lesson.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium">Finished reading?</p>
              <Button onClick={markComplete} disabled={marking}>{marking ? "Saving..." : "Mark as Complete"}</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
