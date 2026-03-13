import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const posts = [
  { slug: "africa-equity-liquidity-2026", title: "Liquidity Patterns In African Equities 2026" },
  { slug: "why-signals-need-macro-context", title: "Why Signals Need Macro Context" }
];

export default function BlogIndex() {
  return (
    <main className="container py-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">Milestone Markets Blog</h1>
      <div className="mt-5 grid gap-3">
        {posts.map((post) => (
          <Card key={post.slug}>
            <CardHeader><CardTitle className="text-lg">{post.title}</CardTitle></CardHeader>
            <CardContent>
              <Link className="text-sm font-medium text-primary underline-offset-2 hover:underline" href={`/blog/${post.slug}`}>
                Read Article
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
