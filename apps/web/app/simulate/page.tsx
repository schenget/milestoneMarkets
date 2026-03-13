"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH !== "false";

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  currency: string;
}

export default function SimulatePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockQuote[]>([]);
  const [selected, setSelected] = useState<StockQuote | null>(null);
  const [tab, setTab] = useState<"BUY" | "SELL">("BUY");
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M">("1D");
  const [quantity, setQuantity] = useState(1);
  const [balance, setBalance] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);
  const [initialised, setInitialised] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("mm_token") : null;
  const devHeaders: Record<string, string> = DEV_BYPASS
    ? { "x-dev-bypass-user": "u-admin", "x-dev-bypass-role": "admin", "x-dev-bypass-country": "GH" }
    : {};
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : devHeaders;
  const headers: Record<string, string> = { ...authHeaders, "Content-Type": "application/json" };

  const chartBars = useMemo(() => {
    const base = selected?.price ?? 15;
    const points = Array.from({ length: 60 }).map((_, idx) => {
      const wave = Math.sin((idx / 8) * Math.PI) * 0.9;
      const drift = (idx - 30) / 55;
      return Math.max(base + wave + drift, 0.5);
    });
    const max = Math.max(...points);
    const min = Math.min(...points);
    return points.map((p) => Number((((p - min) / Math.max(max - min, 0.001)) * 88 + 10).toFixed(2)));
  }, [selected?.price, timeframe]);

  useEffect(() => {
    fetch(`${API}/api/portfolio/stocks/search`, { headers: authHeaders })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: StockQuote[]) => {
        setResults(data);
        if (!selected && data.length > 0) setSelected(data[0]);
      })
      .catch(() => {});

    fetch(`${API}/api/portfolio`, { headers: authHeaders })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setBalance(data.simulatedBalance);
      })
      .catch(() => {});

    setInitialised(true);
  }, []);

  useEffect(() => {
    if (!selected) return;
    const timer = setInterval(() => {
      setResults((prev) =>
        prev.map((item) => {
          if (item.symbol !== selected.symbol) return item;
          const move = (Math.random() - 0.49) * 0.45;
          const nextPrice = Math.max(0.1, item.price + move);
          const nextChange = item.change + move;
          const nextChangePct = (nextChange / Math.max(nextPrice - nextChange, 0.0001)) * 100;
          return {
            ...item,
            price: Number(nextPrice.toFixed(2)),
            change: Number(nextChange.toFixed(2)),
            changePct: Number(nextChangePct.toFixed(2))
          };
        })
      );
      setSelected((prev) => {
        if (!prev) return prev;
        const move = (Math.random() - 0.49) * 0.45;
        const nextPrice = Math.max(0.1, prev.price + move);
        const nextChange = prev.change + move;
        const nextChangePct = (nextChange / Math.max(nextPrice - nextChange, 0.0001)) * 100;
        return {
          ...prev,
          price: Number(nextPrice.toFixed(2)),
          change: Number(nextChange.toFixed(2)),
          changePct: Number(nextChangePct.toFixed(2))
        };
      });
    }, 1800);

    return () => clearInterval(timer);
  }, [selected?.symbol]);

  useEffect(() => {
    if (!selected) return;
    fetch(`${API}/api/analytics/company/${encodeURIComponent(selected.symbol)}?country=GH`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setAnalysis)
      .catch(() => setAnalysis(null));
  }, [selected]);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${API}/api/portfolio/stocks/search?q=${encodeURIComponent(query)}`, { headers: authHeaders })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: StockQuote[]) => {
        setResults(data);
        if (!selected && data.length > 0) setSelected(data[0]);
      })
      .catch(() => {});
  };

  const executeTrade = async () => {
    if (!selected) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/api/portfolio/${tab.toLowerCase()}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ symbol: selected.symbol, quantity })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message ?? "Trade failed");
        setMsgType("error");
      } else {
        setBalance(data.newBalance);
        setMessage(`${tab} ${quantity} x ${selected.symbol} at $${selected.price.toFixed(2)} executed. New balance: $${data.newBalance.toLocaleString()}`);
        setMsgType("success");
      }
    } catch {
      setMessage("Network error. Please try again.");
      setMsgType("error");
    }
    setLoading(false);
  };

  return (
    <main className="container py-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Trading Workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground">Real-time style simulator with chart, watchlist, ticket, and analytics modules.</p>
        </div>
        <div className="flex items-center gap-2">
          {DEV_BYPASS && <Badge variant="outline">Dev Bypass Active</Badge>}
          <Badge>Balance: ${balance?.toLocaleString() ?? "10,000"}</Badge>
        </div>
      </header>

      <form onSubmit={search} className="mt-5 flex gap-2">
        <Input
          type="text"
          placeholder="Search symbol/company (e.g. MTN, Safaricom)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit">Search</Button>
      </form>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{selected ? `${selected.symbol} Chart` : "Select a Stock"}</CardTitle>
          </CardHeader>
          <CardContent>
            {selected ? (
              <>
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{selected.name}</p>
                    <p className="text-2xl font-bold">{selected.currency} {selected.price.toFixed(2)}</p>
                  </div>
                  <p className={selected.change >= 0 ? "text-sm font-semibold text-emerald-600" : "text-sm font-semibold text-rose-600"}>
                    {selected.change >= 0 ? "+" : ""}{selected.change.toFixed(2)} ({selected.changePct >= 0 ? "+" : ""}{selected.changePct}%)
                  </p>
                </div>

                <div className="mb-4 flex gap-2">
                  {(["1D", "1W", "1M", "3M"] as const).map((t) => (
                    <Button key={t} type="button" variant={timeframe === t ? "default" : "outline"} size="sm" onClick={() => setTimeframe(t)}>
                      {t}
                    </Button>
                  ))}
                </div>

                <div className="flex h-56 items-end gap-1 rounded-lg border border-border bg-gradient-to-b from-muted/20 to-background p-3">
                  {chartBars.map((h, i) => (
                    <span
                      key={`${selected.symbol}-${i}`}
                      className={i > chartBars.length - 10 ? "w-full max-w-[5px] rounded-sm bg-primary" : "w-full max-w-[5px] rounded-sm bg-primary/40"}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Streaming simulation updates every ~2s for active symbol.</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select a stock from the watchlist to open chart and ticket.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {initialised && (
            <Card>
              <CardHeader><CardTitle>Watchlist</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {results.length === 0 && <p className="text-sm text-muted-foreground">No stocks found.</p>}
                {results.map((stock) => (
                  <button
                    type="button"
                    key={stock.symbol}
                    className={selected?.symbol === stock.symbol ? "flex w-full items-center justify-between rounded-md border border-primary bg-primary/5 px-3 py-2 text-left" : "flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left hover:bg-muted/60"}
                    onClick={() => setSelected(stock)}
                  >
                    <div>
                      <p className="font-semibold">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{stock.currency} {stock.price.toFixed(2)}</p>
                      <p className={stock.change >= 0 ? "text-xs text-emerald-600" : "text-xs text-rose-600"}>
                        {stock.change >= 0 ? "+" : ""}{stock.changePct}%
                      </p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Order Ticket</CardTitle></CardHeader>
            <CardContent>
              {selected ? (
                <>
                  <div className="mb-3 flex gap-2">
                    <Button type="button" variant={tab === "BUY" ? "default" : "outline"} onClick={() => setTab("BUY")}>BUY</Button>
                    <Button type="button" variant={tab === "SELL" ? "default" : "outline"} onClick={() => setTab("SELL")}>SELL</Button>
                  </div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="qty">Quantity</label>
                  <Input id="qty" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value, 10) || 1))} />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Estimated {tab === "BUY" ? "cost" : "proceeds"}: {selected.currency} {(selected.price * quantity).toFixed(2)}
                  </p>
                  {message && (
                    <p className={msgType === "success" ? "mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700" : "mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700"}>
                      {message}
                    </p>
                  )}
                  <Button className="mt-3 w-full" onClick={executeTrade} disabled={loading}>
                    {loading ? "Executing..." : `${tab} ${quantity} x ${selected.symbol}`}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Ticket activates after selecting a symbol.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Model Overlay</CardTitle></CardHeader>
            <CardContent>
              {analysis ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-md border border-border p-2 text-sm">Composite: <span className="font-semibold">{analysis.composite.score}/100</span></div>
                  <div className="rounded-md border border-border p-2 text-sm">AI Action: <span className="font-semibold">{analysis.composite.action}</span></div>
                  <div className="rounded-md border border-border p-2 text-sm">Macro: <span className="font-semibold">{String(analysis.macroRegime.regime).replaceAll("_", " ")}</span></div>
                  <div className="rounded-md border border-border p-2 text-sm">Liquidity: <span className="font-semibold">{analysis.liquidity.liquidityScore}</span></div>
                  <div className="rounded-md border border-border p-2 text-sm">Slippage: <span className="font-semibold">{analysis.liquidity.slippageEstimatePct}%</span></div>
                  <div className="rounded-md border border-border p-2 text-sm">ML Return: <span className="font-semibold">{analysis.mlPrediction.nextPeriodReturnPct}%</span></div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Analytics panel appears after symbol selection.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
