import { Router } from "express";
import { authGuard, roleGuard } from "../../shared/auth.js";
import { memoryStore } from "../../shared/store.js";

export const adminRouter = Router();

adminRouter.use(authGuard, roleGuard("admin", "operator", "analyst"));

adminRouter.get("/dashboard", (_req, res) => {
  res.json({
    kpis: {
      users: memoryStore.users.length,
      activeSubscriptions: memoryStore.subscriptions.filter((s) => s.status === "active").length,
      countries: memoryStore.countries.length,
      configuredStrategies: memoryStore.strategyConfig.length,
      feedSources: memoryStore.feedSources.length
    },
    systemHealth: "green"
  });
});

adminRouter.get("/analytics", (_req, res) => {
  const signalsByAction = memoryStore.signals.reduce(
    (acc, item) => {
      acc[item.action] = (acc[item.action] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  res.json({
    generatedSignals: memoryStore.signals.length,
    feedItems: memoryStore.feeds.length,
    marketDataRows: memoryStore.marketDataRows.length,
    channels: {
      whatsapp: true,
      ussd: true,
      sms: true,
      web2g: true
    },
    signalsByAction
  });
});

adminRouter.post("/market-data/upload", (req, res) => {
  const csv = String(req.body?.csv ?? "");
  if (!csv.trim()) return res.status(400).json({ message: "csv is required" });

  const [headerLine, ...rows] = csv.trim().split("\n");
  const headers = headerLine.split(",").map((x) => x.trim());
  const parsedRows = rows
    .filter((r) => r.trim())
    .map((row) => {
      const values = row.split(",").map((x) => x.trim());
      return headers.reduce(
        (acc, h, idx) => {
          acc[h] = values[idx] ?? "";
          return acc;
        },
        {} as Record<string, string>
      );
    });

  memoryStore.marketDataRows.push(...parsedRows);
  return res.status(201).json({ imported: parsedRows.length, columns: headers });
});

adminRouter.get("/language-packs", (_req, res) => res.json(memoryStore.languagePacks));
adminRouter.post("/language-packs", (req, res) => {
  memoryStore.languagePacks.push(req.body);
  res.status(201).json(req.body);
});

adminRouter.get("/regulatory-text", (_req, res) => res.json(memoryStore.regulatoryText));
adminRouter.put("/regulatory-text", (req, res) => {
  memoryStore.regulatoryText = [req.body];
  res.json(req.body);
});

// Lesson management
adminRouter.get("/lessons", (_req, res) => res.json(memoryStore.lessons.map(({ content, ...r }) => r)));
adminRouter.get("/lessons/:slug", (req, res) => {
  const lesson = memoryStore.lessons.find((l) => l.slug === req.params.slug);
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });
  return res.json(lesson);
});
adminRouter.post("/lessons", (req, res) => {
  const lesson = { createdAt: new Date().toISOString(), ...req.body };
  memoryStore.lessons.push(lesson);
  return res.status(201).json(lesson);
});
adminRouter.put("/lessons/:slug", (req, res) => {
  const idx = memoryStore.lessons.findIndex((l) => l.slug === req.params.slug);
  if (idx < 0) return res.status(404).json({ message: "Lesson not found" });
  memoryStore.lessons[idx] = { ...memoryStore.lessons[idx], ...req.body };
  return res.json(memoryStore.lessons[idx]);
});
adminRouter.delete("/lessons/:slug", (req, res) => {
  const idx = memoryStore.lessons.findIndex((l) => l.slug === req.params.slug);
  if (idx < 0) return res.status(404).json({ message: "Lesson not found" });
  memoryStore.lessons.splice(idx, 1);
  return res.status(204).send();
});

// User and subscription overviews
adminRouter.get("/users", (_req, res) => {
  res.json(memoryStore.users.map(({ passwordHash, passwordSalt, ...u }) => u));
});
adminRouter.get("/subscriptions", (_req, res) => res.json(memoryStore.subscriptions));
adminRouter.get("/trades", (_req, res) => res.json(memoryStore.simulatedTrades.slice().reverse().slice(0, 100)));

