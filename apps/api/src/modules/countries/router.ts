import { Router } from "express";
import { z } from "zod";
import { authGuard, roleGuard } from "../../shared/auth.js";
import { memoryStore } from "../../shared/store.js";

const countrySchema = z.object({
  code: z.string().length(2),
  name: z.string().min(2),
  currency: z.string().min(3),
  language: z.string().min(2),
  disclaimer: z.string().min(5),
  pricingPlanUsd: z.number().nonnegative()
});

export const countriesRouter = Router();

countriesRouter.get("/", (_req, res) => res.json(memoryStore.countries));

countriesRouter.post("/", authGuard, roleGuard("admin"), (req, res) => {
  const body = countrySchema.safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error.flatten());
  memoryStore.countries.push(body.data);
  return res.status(201).json(body.data);
});
