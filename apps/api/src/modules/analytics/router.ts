import { Router } from "express";
import { z } from "zod";
import { memoryStore } from "../../shared/store.js";
import { fullCompanyAnalysis, indexAnalysis, marketAnalysis } from "./engines.js";

const companyQuerySchema = z.object({
  country: z.string().min(2).max(2).optional()
});

export const analyticsRouter = Router();

analyticsRouter.get("/hubs", (_req, res) => {
  res.json({
    educationHub: ["macro_regime", "liquidity_microstructure", "inflation_adjusted_technical"],
    marketDataHub: ["inflation_adjusted_technical", "liquidity_microstructure", "alternative_data_sentiment"],
    tradingHub: ["liquidity_microstructure", "ml_prediction", "composite_signal"],
    simulatorHub: ["macro_regime", "liquidity_microstructure", "ml_prediction"],
    analyticsHub: ["scenario_valuation", "bayesian_valuation", "ml_prediction", "composite_signal"],
    portfolioHub: ["composite_signal", "scenario_valuation", "bayesian_valuation"]
  });
});

analyticsRouter.get("/market/:country", (req, res) => {
  const country = req.params.country.toUpperCase();
  if (!memoryStore.macroSnapshot[country]) {
    return res.status(404).json({ message: `Country ${country} not found in analytics coverage` });
  }
  return res.json(marketAnalysis(country));
});

analyticsRouter.get("/index/:indexCode", (req, res) => {
  const indexCode = req.params.indexCode.toUpperCase();
  const output = indexAnalysis(indexCode);
  if (!output) return res.status(404).json({ message: `Index ${indexCode} not found` });
  return res.json(output);
});

analyticsRouter.get("/company/:symbol", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  if (!memoryStore.stockQuotes[symbol]) {
    return res.status(404).json({ message: `Symbol ${symbol} not found` });
  }

  const parsed = companyQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const country = parsed.data.country?.toUpperCase() ?? "GH";
  const output = fullCompanyAnalysis(symbol, country);
  return res.json(output);
});

analyticsRouter.get("/search", (req, res) => {
  const q = String(req.query.q ?? "").trim().toUpperCase();
  const symbols = Object.keys(memoryStore.stockQuotes)
    .filter((symbol) => !q || symbol.includes(q) || memoryStore.stockQuotes[symbol].name.toUpperCase().includes(q))
    .map((symbol) => ({ ...memoryStore.stockQuotes[symbol] }));

  const indexes = Object.values(memoryStore.marketIndexes).filter(
    (idx) => !q || idx.code.includes(q) || idx.name.toUpperCase().includes(q)
  );

  return res.json({ symbols, indexes, countries: Object.keys(memoryStore.macroSnapshot) });
});
