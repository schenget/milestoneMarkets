import { Router } from "express";
import { z } from "zod";
import { StrategyEngine } from "@milestone/strategy-engine";
import { memoryStore } from "../../shared/store.js";

const engine = new StrategyEngine();

const signalSchema = z.object({
  symbol: z.string().min(1),
  country: z.string().min(2),
  strategy: z.enum(["advanced_quantitative", "technical_fundamental_hybrid", "long_horizon_value"]),
  timeframeDays: z.number().int().positive(),
  sentimentScore: z.number().optional(),
  marketFeatures: z.record(z.number())
});

export const signalsRouter = Router();

signalsRouter.post("/generate", (req, res) => {
  const parsed = signalSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const config = memoryStore.strategyConfig.find(
    (s) => s.strategy === parsed.data.strategy && s.country === parsed.data.country
  );

  if (!config || !config.enabled) {
    return res.status(404).json({ message: "Strategy config not found or disabled" });
  }

  const result = engine.run(
    {
      symbol: parsed.data.symbol,
      country: parsed.data.country,
      timeframeDays: parsed.data.timeframeDays,
      sentimentScore: parsed.data.sentimentScore,
      marketFeatures: parsed.data.marketFeatures
    },
    config
  );

  memoryStore.signals.push(result);

  return res.json(result);
});
