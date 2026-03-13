import { Router } from "express";
import { defaultAdapters } from "@milestone/integration-framework";

export const integrationsRouter = Router();

integrationsRouter.get("/status", async (_req, res) => {
  const statuses = await Promise.all(
    defaultAdapters.map(async (adapter) => ({
      provider: adapter.provider,
      type: adapter.type,
      enabled: adapter.enabled,
      ...(await adapter.health())
    }))
  );
  res.json(statuses);
});
