"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH !== "false";

interface Holding {
  symbol: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPct: number;
}

interface Portfolio {
  simulatedBalance: number;
  portfolioValue: number;
  totalValue: number;
  holdings: Holding[];
}

interface Trade {
  id: string;
  symbol: string;
  action: "BUY" | "SELL";
  qty: number;
  price: number;
  date: string;
  pnl?: number;
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [guest, setGuest] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("mm_token");
    if (!token && !DEV_BYPASS) {
      setGuest(true);
      return;
    }

    const headers: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {
          "x-dev-bypass-user": "u-admin",
          "x-dev-bypass-role": "admin",
          "x-dev-bypass-country": "GH"
        };

    fetch(`${API}/api/portfolio`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setPortfolio(d);
        else setError("Could not load portfolio.");
      })
      .catch(() => setError("API unavailable."));

    fetch(`${API}/api/portfolio/trades`, { headers }).then((r) => (r.ok ? r.json() : [])).then(setTrades).catch(() => {});
  }, []);

  if (guest) {
    return (
      <main className="container py-8">
        <h1 className="font-display text-3xl font-bold">Portfolio</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to view your portfolio.</p>
        <div className="mt-4 flex gap-2">
          <Link href="/login"><Button>Sign In</Button></Link>
          <Link href="/register"><Button variant="outline">Create Account</Button></Link>
        </div>
      </main>
    );
  }

  const totalPnl = portfolio?.holdings.reduce((sum, h) => sum + h.pnl, 0) ?? 0;

  return (
    <main className="container py-8">
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Portfolio</h1>
      {error && <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {portfolio && (
        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card><CardHeader><CardTitle className="text-sm">Cash Balance</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">${portfolio.simulatedBalance.toLocaleString()}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Holdings Value</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">${portfolio.portfolioValue.toLocaleString()}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Total Value</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Unrealized P&L</CardTitle></CardHeader><CardContent><p className={totalPnl >= 0 ? "text-2xl font-bold text-emerald-600" : "text-2xl font-bold text-rose-600"}>{totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}</p></CardContent></Card>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Holdings</h2>
        <Card><CardContent className="pt-6">
          {portfolio?.holdings.length ? (
            <Table>
              <TableHeader><TableRow><TableHead>Stock</TableHead><TableHead>Shares</TableHead><TableHead>Avg Buy</TableHead><TableHead>Current</TableHead><TableHead>Value</TableHead><TableHead>P&L</TableHead><TableHead>P&L %</TableHead></TableRow></TableHeader>
              <TableBody>
                {portfolio.holdings.map((h) => (
                  <TableRow key={h.symbol}>
                    <TableCell className="font-semibold">{h.symbol}</TableCell>
                    <TableCell>{h.qty}</TableCell>
                    <TableCell>${h.avgPrice.toFixed(2)}</TableCell>
                    <TableCell>${h.currentPrice.toFixed(2)}</TableCell>
                    <TableCell>${h.value.toFixed(2)}</TableCell>
                    <TableCell className={h.pnl >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>{h.pnl >= 0 ? "+" : ""}${h.pnl.toFixed(2)}</TableCell>
                    <TableCell className={h.pnlPct >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>{h.pnlPct >= 0 ? "+" : ""}{h.pnlPct}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No holdings yet.</p>
          )}
        </CardContent></Card>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Trade History</h2>
        <Card><CardContent className="pt-6">
          {trades.length ? (
            <Table>
              <TableHeader><TableRow><TableHead>Symbol</TableHead><TableHead>Action</TableHead><TableHead>Qty</TableHead><TableHead>Price</TableHead><TableHead>P&L</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {trades.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-semibold">{t.symbol}</TableCell>
                    <TableCell><Badge variant={t.action === "BUY" ? "secondary" : "outline"}>{t.action}</Badge></TableCell>
                    <TableCell>{t.qty}</TableCell>
                    <TableCell>${t.price.toFixed(2)}</TableCell>
                    <TableCell>{t.pnl !== undefined ? <span className={t.pnl >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>{t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}</span> : "-"}</TableCell>
                    <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No trades yet.</p>
          )}
        </CardContent></Card>
      </section>

      <div className="mt-6 flex gap-2">
        <Link href="/simulate"><Button>Make a Trade</Button></Link>
        <Link href="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
      </div>
    </main>
  );
}
