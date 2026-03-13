import { Router } from "express";
import { z } from "zod";
import { FeedEngine, RawFeedItem } from "@milestone/feed-engine";
import { memoryStore } from "../../shared/store.js";
import { authGuard, roleGuard } from "../../shared/auth.js";

const feedEngine = new FeedEngine();

const ingestSchema = z.object({
  items: z.array(
    z.object({
      source: z.string(),
      title: z.string(),
      summary: z.string(),
      url: z.string().url(),
      publishedAt: z.string(),
      tags: z.array(z.string()).optional(),
      country: z.string(),
      sector: z.string().optional(),
      symbol: z.string().optional()
    })
  )
});

export const feedsRouter = Router();

feedsRouter.get("/items", (req, res) => {
  const country = req.query.country as string | undefined;
  const engineItems = feedEngine.list(country);
  if (engineItems.length > 0) return res.json(engineItems);

  const storeItems = country
    ? memoryStore.feeds.filter((item) => item.country === country)
    : memoryStore.feeds;
  res.json(storeItems);
});

feedsRouter.post("/ingest", authGuard, roleGuard("admin", "analyst"), (req, res) => {
  const body = ingestSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error.flatten());

  const normalized = body.data.items.map((item: RawFeedItem) => feedEngine.normalize(item));
  const deduped = feedEngine.deduplicate(normalized);
  memoryStore.feeds = feedEngine.upsert(deduped);

  const alerts = deduped.filter((i) => Math.abs(i.sentiment) >= 0.4).map((i) => ({ id: i.id, title: i.title, sentiment: i.sentiment }));

  return res.status(201).json({ stored: deduped.length, alerts });
});

feedsRouter.get("/sources", authGuard, roleGuard("admin"), (_req, res) => {
  res.json(memoryStore.feedSources);
});

feedsRouter.post("/sources", authGuard, roleGuard("admin"), (req, res) => {
  const source = { id: `feed-${memoryStore.feedSources.length + 1}`, ...req.body };
  memoryStore.feedSources.push(source);
  res.status(201).json(source);
});
