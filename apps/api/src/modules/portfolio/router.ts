import { Router } from "express";
import { z } from "zod";
import { authGuard } from "../../shared/auth.js";
import { memoryStore } from "../../shared/store.js";

const buySchema = z.object({
  symbol: z.string().min(1).toUpperCase(),
  quantity: z.number().int().positive()
});

const sellSchema = z.object({
  symbol: z.string().min(1).toUpperCase(),
  quantity: z.number().int().positive()
});

export const portfolioRouter = Router();

portfolioRouter.use(authGuard);

portfolioRouter.get("/stocks/search", (req, res) => {
  const q = String(req.query.q ?? "").toUpperCase().trim();
  if (!q) return res.json(Object.values(memoryStore.stockQuotes));
  const results = Object.values(memoryStore.stockQuotes).filter(
    (s) => s.symbol.includes(q) || s.name.toUpperCase().includes(q)
  );
  return res.json(results);
});

portfolioRouter.get("/stocks/quote/:symbol", (req, res) => {
  const quote = memoryStore.stockQuotes[req.params.symbol.toUpperCase()];
  if (!quote) return res.status(404).json({ message: "Stock not found" });
  return res.json(quote);
});

portfolioRouter.get("/", (req, res) => {
  const reqUser = (req as any).user;
  let pf = memoryStore.portfolios.find((p) => p.userId === reqUser.sub);
  if (!pf) {
    pf = { userId: reqUser.sub, simulatedBalance: 10000, holdings: [] };
    memoryStore.portfolios.push(pf);
  }

  const holdings = pf.holdings.map((h) => {
    const quote = memoryStore.stockQuotes[h.symbol];
    const currentPrice = quote?.price ?? h.avgPrice;
    const value = +(currentPrice * h.qty).toFixed(2);
    const pnl = +((currentPrice - h.avgPrice) * h.qty).toFixed(2);
    const pnlPct = +(((currentPrice - h.avgPrice) / h.avgPrice) * 100).toFixed(2);
    return { ...h, currentPrice, value, pnl, pnlPct };
  });

  const portfolioValue = +holdings.reduce((sum, h) => sum + h.value, 0).toFixed(2);
  const totalValue = +(pf.simulatedBalance + portfolioValue).toFixed(2);

  return res.json({ simulatedBalance: pf.simulatedBalance, portfolioValue, totalValue, holdings });
});

portfolioRouter.post("/buy", (req, res) => {
  const reqUser = (req as any).user;
  const body = buySchema.safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error.flatten());

  const quote = memoryStore.stockQuotes[body.data.symbol];
  if (!quote) return res.status(404).json({ message: "Stock not found. Available symbols: " + Object.keys(memoryStore.stockQuotes).join(", ") });

  let pf = memoryStore.portfolios.find((p) => p.userId === reqUser.sub);
  if (!pf) {
    pf = { userId: reqUser.sub, simulatedBalance: 10000, holdings: [] };
    memoryStore.portfolios.push(pf);
  }

  const totalCost = +(quote.price * body.data.quantity).toFixed(2);
  if (pf.simulatedBalance < totalCost) {
    return res.status(400).json({ message: `Insufficient balance. Need $${totalCost}, have $${pf.simulatedBalance}` });
  }

  pf.simulatedBalance = +(pf.simulatedBalance - totalCost).toFixed(2);

  const existing = pf.holdings.find((h) => h.symbol === body.data.symbol);
  if (existing) {
    const totalQty = existing.qty + body.data.quantity;
    existing.avgPrice = +((existing.avgPrice * existing.qty + quote.price * body.data.quantity) / totalQty).toFixed(4);
    existing.qty = totalQty;
  } else {
    pf.holdings.push({ symbol: body.data.symbol, qty: body.data.quantity, avgPrice: quote.price });
  }

  const trade = {
    id: `t-${Date.now()}`,
    userId: reqUser.sub,
    symbol: body.data.symbol,
    action: "BUY" as const,
    qty: body.data.quantity,
    price: quote.price,
    date: new Date().toISOString()
  };
  memoryStore.simulatedTrades.push(trade);

  return res.status(201).json({ trade, newBalance: pf.simulatedBalance });
});

portfolioRouter.post("/sell", (req, res) => {
  const reqUser = (req as any).user;
  const body = sellSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error.flatten());

  const quote = memoryStore.stockQuotes[body.data.symbol];
  if (!quote) return res.status(404).json({ message: "Stock not found" });

  const pf = memoryStore.portfolios.find((p) => p.userId === reqUser.sub);
  if (!pf) return res.status(400).json({ message: "No portfolio found" });

  const holding = pf.holdings.find((h) => h.symbol === body.data.symbol);
  if (!holding || holding.qty < body.data.quantity) {
    return res.status(400).json({ message: "Insufficient shares to sell" });
  }

  const proceeds = +(quote.price * body.data.quantity).toFixed(2);
  const pnl = +((quote.price - holding.avgPrice) * body.data.quantity).toFixed(2);

  holding.qty -= body.data.quantity;
  if (holding.qty === 0) {
    pf.holdings = pf.holdings.filter((h) => h.symbol !== body.data.symbol);
  }
  pf.simulatedBalance = +(pf.simulatedBalance + proceeds).toFixed(2);

  const trade = {
    id: `t-${Date.now()}`,
    userId: reqUser.sub,
    symbol: body.data.symbol,
    action: "SELL" as const,
    qty: body.data.quantity,
    price: quote.price,
    date: new Date().toISOString(),
    pnl
  };
  memoryStore.simulatedTrades.push(trade);

  return res.status(201).json({ trade, pnl, newBalance: pf.simulatedBalance });
});

portfolioRouter.get("/trades", (req, res) => {
  const reqUser = (req as any).user;
  const trades = memoryStore.simulatedTrades
    .filter((t) => t.userId === reqUser.sub)
    .slice()
    .reverse()
    .slice(0, 50);
  return res.json(trades);
});
