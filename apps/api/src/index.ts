import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/router.js";
import { usersRouter } from "./modules/users/router.js";
import { subscriptionsRouter } from "./modules/subscriptions/router.js";
import { countriesRouter } from "./modules/countries/router.js";
import { strategiesRouter } from "./modules/strategies/router.js";
import { signalsRouter } from "./modules/signals/router.js";
import { simulationRouter } from "./modules/simulation/router.js";
import { feedsRouter } from "./modules/feeds/router.js";
import { channelsRouter } from "./modules/channels/router.js";
import { integrationsRouter } from "./modules/integrations/router.js";
import { tradingRouter } from "./modules/trading/router.js";
import { adminRouter } from "./modules/admin/router.js";
import { healthRouter } from "./modules/health/router.js";
import { lessonsRouter } from "./modules/lessons/router.js";
import { portfolioRouter } from "./modules/portfolio/router.js";
import { analyticsRouter } from "./modules/analytics/router.js";
import { devRouter } from "./modules/dev/router.js";
import { seedVisualizationData } from "./shared/store.js";

const app = express();
const port = Number(process.env.PORT ?? 8080);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({
    name: "Milestone Markets API",
    company: "Milestonecraft Investments",
    channels: ["WhatsApp", "USSD", "SMS", "2G Web"],
    docs: "/api/docs"
  });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/countries", countriesRouter);
app.use("/api/strategies", strategiesRouter);
app.use("/api/signals", signalsRouter);
app.use("/api/simulation", simulationRouter);
app.use("/api/feeds", feedsRouter);
app.use("/api/channels", channelsRouter);
app.use("/api/integrations", integrationsRouter);
app.use("/api/trading", tradingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/lessons", lessonsRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/health", healthRouter);

if (process.env.NODE_ENV !== "production") {
  app.use("/api/dev", devRouter);
}

app.get("/api/docs", (_req, res) => {
  res.type("text/plain").send("See docs/API.md in repository for full API reference.");
});

if (process.env.NODE_ENV !== "production" && process.env.DEV_AUTO_SEED !== "false") {
  const summary = seedVisualizationData();
  console.log("[dev] visualization data seeded", summary);
}

app.listen(port, () => {
  console.log(`Milestone Markets API running on :${port}`);
});
