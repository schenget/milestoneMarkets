"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface SearchPayload {
  symbols: Array<{ symbol: string; name: string; price: number; changePct: number; currency: string }>;
  indexes: Array<{ code: string; name: string; country: string }>;
  countries: string[];
}

export default function AnalyticsPage() {
  const [searchData, setSearchData] = useState<SearchPayload>({ symbols: [], indexes: [], countries: [] });
  const [query, setQuery] = useState("MTN");
  const [country, setCountry] = useState("GH");
  const [symbol, setSymbol] = useState("MTN");
  const [indexCode, setIndexCode] = useState("GSE-CI");
  const [companyAnalysis, setCompanyAnalysis] = useState<any>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<any>(null);
  const [indexAnalysis, setIndexAnalysis] = useState<any>(null);

  const loadSearch = async (q = "") => {
    const data = await fetch(`${API}/api/analytics/search?q=${encodeURIComponent(q)}`).then((r) => r.json());
    setSearchData(data);
  };

  const refreshAnalyses = async (s: string, c: string, i: string) => {
    const [co, ma, ix] = await Promise.all([
      fetch(`${API}/api/analytics/company/${encodeURIComponent(s)}?country=${encodeURIComponent(c)}`).then((r) => r.json()),
      fetch(`${API}/api/analytics/market/${encodeURIComponent(c)}`).then((r) => r.json()),
      fetch(`${API}/api/analytics/index/${encodeURIComponent(i)}`).then((r) => r.json())
    ]);
    setCompanyAnalysis(co);
    setMarketAnalysis(ma);
    setIndexAnalysis(ix);
  };

  useEffect(() => {
    loadSearch().catch(() => {});
    refreshAnalyses(symbol, country, indexCode).catch(() => {});
  }, []);

  const selectedSymbolOptions = useMemo(
    () => searchData.symbols.length ? searchData.symbols : [{ symbol: "MTN", name: "MTN Group", price: 0, changePct: 0, currency: "ZAR" }],
    [searchData.symbols]
  );

  return (
    <main className="container py-8">
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Analytics & Insights Hub</h1>
      <p className="mt-2 text-sm text-muted-foreground">Company, market, and index analysis using macro, liquidity, valuation, sentiment, ML, and composite scoring engines.</p>

      <Card className="mt-5">
        <CardHeader><CardTitle>Analysis Controls</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={(e) => { e.preventDefault(); loadSearch(query).catch(() => {}); }} className="flex gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search symbol/index" />
            <Button type="submit">Search</Button>
          </form>
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
              {selectedSymbolOptions.map((s) => <option key={s.symbol} value={s.symbol}>{s.symbol} - {s.name}</option>)}
            </select>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={country} onChange={(e) => setCountry(e.target.value)}>
              {(searchData.countries.length ? searchData.countries : ["GH", "KE", "NG", "ZA"]).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={indexCode} onChange={(e) => setIndexCode(e.target.value)}>
              {(searchData.indexes.length ? searchData.indexes : [{ code: "GSE-CI", name: "Ghana Stock Exchange Composite", country: "GH" }]).map((idx) => <option key={idx.code} value={idx.code}>{idx.code} - {idx.name}</option>)}
            </select>
            <Button onClick={() => refreshAnalyses(symbol, country, indexCode)}>Run Analysis</Button>
          </div>
        </CardContent>
      </Card>

      {companyAnalysis && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Company Analysis: {companyAnalysis.symbol}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Composite</p><p className="text-2xl font-bold">{companyAnalysis.composite.score}</p><p className="text-sm">{companyAnalysis.composite.action}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Macro Regime</p><p className="text-lg font-semibold capitalize">{companyAnalysis.macroRegime.regime.replaceAll("_", " ")}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Liquidity</p><p className="text-2xl font-bold">{companyAnalysis.liquidity.liquidityScore}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">ML Return</p><p className="text-2xl font-bold">{companyAnalysis.mlPrediction.nextPeriodReturnPct}%</p></CardContent></Card>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Card><CardContent className="pt-6 text-sm">Low/Base/High: ${companyAnalysis.scenarioValuation.fairValueRange.low} / ${companyAnalysis.scenarioValuation.fairValueRange.base} / ${companyAnalysis.scenarioValuation.fairValueRange.high}</CardContent></Card>
            <Card><CardContent className="pt-6 text-sm">Posterior: ${companyAnalysis.bayesianValuation.posteriorFairValue}</CardContent></Card>
            <Card><CardContent className="pt-6 text-sm">Sentiment: {companyAnalysis.sentiment.score} <Badge variant="outline" className="ml-2 capitalize">{companyAnalysis.sentiment.trend}</Badge></CardContent></Card>
          </div>
        </section>
      )}

      {marketAnalysis && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Market Analysis: {marketAnalysis.country}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Risk Label</p><p className="text-lg font-semibold capitalize">{marketAnalysis.marketRiskLabel}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Avg Composite</p><p className="text-2xl font-bold">{marketAnalysis.averageCompositeScore}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Avg Liquidity</p><p className="text-2xl font-bold">{marketAnalysis.averageLiquidityScore}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Macro</p><p className="text-sm capitalize">{marketAnalysis.macroRegime.regime.replaceAll("_", " ")}</p></CardContent></Card>
          </div>
        </section>
      )}

      {indexAnalysis && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Index Analysis: {indexAnalysis.code}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Index Level</p><p className="text-2xl font-bold">{indexAnalysis.level}</p><p className="text-sm text-muted-foreground">{indexAnalysis.changePct}% today</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-xs uppercase text-muted-foreground">Composite</p><p className="text-2xl font-bold">{indexAnalysis.indexCompositeScore}</p><p className="text-sm">{indexAnalysis.direction}</p></CardContent></Card>
          </div>
          <Card className="mt-4"><CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow><TableHead>Component</TableHead><TableHead>Composite</TableHead><TableHead>Action</TableHead><TableHead>Risk</TableHead></TableRow></TableHeader>
              <TableBody>
                {indexAnalysis.componentAnalyses.map((c: any) => (
                  <TableRow key={c.symbol}>
                    <TableCell className="font-semibold">{c.symbol}</TableCell>
                    <TableCell>{c.composite.score}</TableCell>
                    <TableCell>{c.composite.action}</TableCell>
                    <TableCell>{c.composite.riskLabel}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </section>
      )}
    </main>
  );
}
