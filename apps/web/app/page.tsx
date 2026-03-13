import Link from "next/link";
import { Badge } from "./components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Milestonecraft Investments",
  brand: "Milestone Markets",
  url: "https://milestonemarkets.example",
  areaServed: ["Ghana", "Kenya", "Nigeria", "South Africa", "Zimbabwe"],
  description: "Stock insights and simulation platform for African markets"
};

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(240,196,91,0.22),transparent_36%),radial-gradient(circle_at_80%_0%,rgba(58,92,140,0.2),transparent_40%),linear-gradient(180deg,#fbfdff_0%,#f4f8fc_45%,#eef4fa_100%)]" />
      <section className="container py-8 md:py-12">
        <div className="animate-fade-up rounded-2xl border border-border/70 bg-card/80 p-6 shadow-xl backdrop-blur md:p-10">
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">Milestonecraft Investments Presents</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">Milestone Markets</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
            Stock market insights and buy/sell/hold signals delivered through WhatsApp, USSD, SMS, and fast-loading web experiences.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/daily" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">Daily Market Summaries</Link>
            <Link href="/countries/ghana" className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted">Country Investment Guides</Link>
            <Link href="/blog" className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted">Insights Blog</Link>
          </div>
        </div>
      </section>

      <section className="container grid gap-4 pb-4 md:grid-cols-3">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Three-Tier Strategy Intelligence</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Advanced Quantitative, Technical-Fundamental Hybrid, and Long-Horizon Value models with plain-language signal reasons.
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Low-Tech Ready Channels</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Designed for low-banking and low-bandwidth contexts, enabling users through familiar tools and mobile-first channels.
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Simulation Before Decisions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Run scenario simulations using starting capital, selected strategy, and country-specific market assumptions.
          </CardContent>
        </Card>
      </section>

      <section className="container grid gap-4 py-4 pb-10 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Financial Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Structured lessons covering stock basics, risk management, and long-term investing in plain language.</p>
            <Link href="/learn" className="inline-flex rounded-md bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground">Browse Lessons</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Practice Simulated Trading</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Start with a $10,000 virtual balance, place simulated orders, and track progress without risking funds.</p>
            <Link href="/simulate" className="inline-flex rounded-md bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground">Start Simulating</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>View holdings, average buy price, current value, and performance in a single dashboard.</p>
            <Link href="/register" className="inline-flex rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Create Free Account</Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
