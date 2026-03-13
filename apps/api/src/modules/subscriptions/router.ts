import { Router } from "express";
import { authGuard, roleGuard } from "../../shared/auth.js";
import { memoryStore } from "../../shared/store.js";

export const subscriptionsRouter = Router();

subscriptionsRouter.get("/", authGuard, roleGuard("admin", "operator"), (_req, res) => {
  res.json(memoryStore.subscriptions);
});
