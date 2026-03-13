import { Router } from "express";
import { PlaceholderTradingService } from "@milestone/trading-placeholder";

const tradingService = new PlaceholderTradingService();
export const tradingRouter = Router();

tradingRouter.post("/orders", async (_req, res) => {
  const result = await tradingService.submitOrder();
  res.status(202).json(result);
});

tradingRouter.get("/wallets/:accountId", (req, res) => {
  res.json({
    accountId: req.params.accountId,
    availableBalance: 0,
    reservedBalance: 0,
    currency: "USD",
    mode: "placeholder"
  });
});
