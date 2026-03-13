import { Router } from "express";
import { StrategyEngine } from "@milestone/strategy-engine";
import { memoryStore } from "../../shared/store.js";

const engine = new StrategyEngine();
export const channelsRouter = Router();

channelsRouter.post("/whatsapp/webhook", (req, res) => {
  const text = String(req.body?.text ?? "").trim().toLowerCase();
  const symbol = String(req.body?.symbol ?? "MTN");
  const country = String(req.body?.country ?? "GH");

  if (text.includes("signal")) {
    const config = memoryStore.strategyConfig.find((s) => s.strategy === "technical_fundamental_hybrid" && s.country === country);
    if (!config) return res.status(404).json({ message: "No strategy configured" });

    const output = engine.run(
      {
        symbol,
        country,
        timeframeDays: 14,
        sentimentScore: 55,
        marketFeatures: { rsi: 47, macd: 1.4, pe: 12, debtToEquity: 0.9, liquidityScore: 70 }
      },
      config
    );

    return res.json({
      channel: "whatsapp",
      outbound:
        `${output.symbol} ${output.action} (${output.confidence}%)\\nRisk: ${output.risk}\\n${output.explanation}`
    });
  }

  return res.json({ channel: "whatsapp", outbound: "Send SIGNAL <ticker> or SIMULATE <amount> <days>." });
});

channelsRouter.post("/ussd/session", (req, res) => {
  const input = String(req.body?.text ?? "");
  if (!input) return res.json({ menu: "1. Get today signals\\n2. Run simulation\\n3. Market headlines" });
  return res.json({ message: "USSD session received", input });
});

channelsRouter.post("/sms/inbound", (req, res) => {
  const text = String(req.body?.text ?? "").toUpperCase();
  return res.json({
    inbound: text,
    response: text.startsWith("SIGNAL")
      ? "Latest signal: HOLD with 63% confidence."
      : "Send: SIGNAL TICKER or SIM 500 90"
  });
});
