import { Router } from "express";
import { z } from "zod";
import { authGuard, roleGuard } from "../../shared/auth.js";
import { memoryStore } from "../../shared/store.js";

const updateSchema = z.object({
  strategy: z.enum(["advanced_quantitative", "technical_fundamental_hybrid", "long_horizon_value"]),
  country: z.string().min(2),
  enabled: z.boolean(),
  parameters: z.record(z.union([z.number(), z.string(), z.boolean()]))
});

export const strategiesRouter = Router();

strategiesRouter.get("/config", authGuard, roleGuard("admin", "analyst"), (_req, res) => {
  res.json(memoryStore.strategyConfig);
});

strategiesRouter.put("/config", authGuard, roleGuard("admin", "analyst"), (req, res) => {
  const body = updateSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error.flatten());
  const idx = memoryStore.strategyConfig.findIndex(
    (s) => s.strategy === body.data.strategy && s.country === body.data.country
  );
  if (idx >= 0) memoryStore.strategyConfig[idx] = body.data;
  else memoryStore.strategyConfig.push(body.data);
  return res.json(body.data);
});
