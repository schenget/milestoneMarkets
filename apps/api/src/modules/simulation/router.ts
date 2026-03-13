import { Router } from "express";
import { z } from "zod";
import { SimulationResult } from "@milestone/core-types";

const schema = z.object({
  startingCapital: z.number().positive(),
  strategy: z.enum(["advanced_quantitative", "technical_fundamental_hybrid", "long_horizon_value"]),
  periodDays: z.number().int().positive(),
  country: z.string().min(2),
  symbols: z.array(z.string().min(1)).min(1)
});

export const simulationRouter = Router();

simulationRouter.post("/run", (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const trades = Array.from({ length: Math.min(12, Math.floor(parsed.data.periodDays / 7) + 1) }).map((_, idx) => {
    const direction = idx % 3 === 0 ? "BUY" : idx % 5 === 0 ? "SELL" : "HOLD";
    const price = 10 + idx * 0.8;
    const quantity = 5 + (idx % 4);
    return {
      date: new Date(Date.now() - (tradesLength(parsed.data.periodDays) - idx) * 86_400_000).toISOString().slice(0, 10),
      symbol: parsed.data.symbols[idx % parsed.data.symbols.length],
      action: direction as "BUY" | "SELL" | "HOLD",
      quantity,
      price,
      pnl: Number(((Math.random() - 0.35) * 20).toFixed(2))
    };
  });

  const currentValue = Number((parsed.data.startingCapital * (1 + parsed.data.periodDays / 1500)).toFixed(2));
  const growthPct = Number((((currentValue - parsed.data.startingCapital) / parsed.data.startingCapital) * 100).toFixed(2));

  const chartSeries = trades.map((t, i) => ({
    date: t.date,
    value: Number((parsed.data.startingCapital + (i + 1) * ((currentValue - parsed.data.startingCapital) / trades.length)).toFixed(2))
  }));

  const result: SimulationResult = {
    startingCapital: parsed.data.startingCapital,
    currentValue,
    growthPct,
    tradeHistory: trades,
    chartSeries,
    whatsappChartUrl: `https://quickchart.io/chart?c=${encodeURIComponent(
      JSON.stringify({
        type: "line",
        data: { labels: chartSeries.map((x) => x.date), datasets: [{ label: "Portfolio", data: chartSeries.map((x) => x.value) }] }
      })
    )}`
  };

  return res.json(result);
});

function tradesLength(days: number) {
  return Math.min(12, Math.floor(days / 7) + 1);
}
