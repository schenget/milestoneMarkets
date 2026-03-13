"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH !== "false";

interface Portfolio {
  simulatedBalance: number;
  portfolioValue: number;
  totalValue: number;
  holdings: Array<{ symbol: string; qty: number; avgPrice: number; currentPrice: number; value: number; pnl: number; pnlPct: number }>;
}

interface ProgressData {
  completedCount: number;
  totalLessons: number;
  progressPct: number;
  completedLessons: string[];
}

interface Lesson {
  slug: string;
  title: string;
}

interface Trade {
  id: string;
  symbol: string;
  action: "BUY" | "SELL";
  qty: number;
  price: number;
  date: string;
}

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [user, setUser] = useState<{ name?: string | null } | null>(null);
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("mm_token");
    const raw = localStorage.getItem("mm_user");
    if (raw) setUser(JSON.parse(raw));

    const headers: HeadersInit = token
      ? { Authorization: `Bearer ${token}` }
      : DEV_BYPASS
        ? {
            "x-dev-bypass-user": "u-admin",
            "x-dev-bypass-role": "admin",
            "x-dev-bypass-country": "GH"
          }
        : {};

    if (!token && !DEV_BYPASS) {
      setGuest(true);
    }

    fetch(`${API}/api/lessons`).then((r) => r.json()).then(setLessons).catch(() => {});

    if (token || DEV_BYPASS) {
      fetch(`${API}/api/portfolio`, { headers }).then((r) => r.json()).then(setPortfolio).catch(() => {});
      fetch(`${API}/api/lessons/progress/me`, { headers }).then((r) => r.json()).then(setProgress).catch(() => {});
      fetch(`${API}/api/portfolio/trades`, { headers }).then((r) => r.json()).then((data) => setTrades(data.slice(0, 5))).catch(() => {});
    }
  }, []);

  const nextLesson = lessons.find((l: any) => !progress?.completedLessons.includes(l.slug));

  if (guest) {
    return (
      <main className="container py-8">
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to view your portfolio and progress.</p>
        <div className="mt-4 flex gap-2">
          <Link href="/login"><Button>Sign In</Button></Link>
          <Link href="/register"><Button variant="outline">Create Account</Button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-8">
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Welcome back{user?.name ? `, ${user.name}` : ""}.</p>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Simulated Balance</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">${portfolio?.simulatedBalance?.toLocaleString() ?? "-"}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Portfolio Value</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">${portfolio?.portfolioValue?.toLocaleString() ?? "-"}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Total Value</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">${portfolio?.totalValue?.toLocaleString() ?? "-"}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Lessons Completed</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{progress ? `${progress.completedCount}/${progress.totalLessons}` : "-"}</p></CardContent></Card>
      </section>

      {progress && (
        <section className="mt-5 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Learning Progress</h2>
            <span className="text-sm font-semibold">{progress.progressPct}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${progress.progressPct}%` }} />
          </div>
          {nextLesson && <Link href={`/learn/${nextLesson.slug}`} className="mt-3 inline-block text-sm font-semibold text-primary">Continue: {nextLesson.title}</Link>}
        </section>
      )}

      {portfolio && portfolio.holdings.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Holdings</h2>
          <Card><CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Symbol</TableHead><TableHead>Shares</TableHead><TableHead>Avg Price</TableHead><TableHead>Current</TableHead><TableHead>Value</TableHead><TableHead>P&L</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.holdings.map((h) => (
                  <TableRow key={h.symbol}>
                    <TableCell className="font-semibold">{h.symbol}</TableCell>
                    <TableCell>{h.qty}</TableCell>
                    <TableCell>${h.avgPrice.toFixed(2)}</TableCell>
                    <TableCell>${h.currentPrice.toFixed(2)}</TableCell>
                    <TableCell>${h.value.toFixed(2)}</TableCell>
                    <TableCell className={h.pnl >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>{h.pnl >= 0 ? "+" : ""}${h.pnl.toFixed(2)} ({h.pnlPct}%)</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </section>
      )}

      {trades.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Recent Trades</h2>
          <Card><CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow><TableHead>Symbol</TableHead><TableHead>Action</TableHead><TableHead>Qty</TableHead><TableHead>Price</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {trades.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-semibold">{t.symbol}</TableCell>
                    <TableCell><Badge variant={t.action === "BUY" ? "secondary" : "outline"}>{t.action}</Badge></TableCell>
                    <TableCell>{t.qty}</TableCell>
                    <TableCell>${t.price.toFixed(2)}</TableCell>
                    <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </section>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="font-semibold">Continue Learning</p><Link href="/learn" className="mt-2 inline-block text-sm font-semibold text-primary">View lessons</Link></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="font-semibold">Practice Trading</p><Link href="/simulate" className="mt-2 inline-block text-sm font-semibold text-primary">Open simulator</Link></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="font-semibold">Review Portfolio</p><Link href="/portfolio" className="mt-2 inline-block text-sm font-semibold text-primary">View portfolio</Link></CardContent></Card>
      </section>
    </main>
  );
}
