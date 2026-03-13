import { CountryConfig, Role, StrategyConfig, StrategyOutput } from "@milestone/core-types";
import { FeedItem } from "@milestone/core-types";

export interface AppUser {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  role: Role;
  country: string;
  language?: string;
  experienceLevel?: "beginner" | "intermediate";
  accountType?: "free" | "premium";
  passwordHash?: string;
  passwordSalt?: string;
}

export const memoryStore = {
  users: [
    { id: "u-admin", name: "Platform Admin", phone: "+233000000000", role: "admin" as Role, country: "GH", language: "en", accountType: "premium" as const }
  ] as AppUser[],
  otp: new Map<string, string>(),
  subscriptions: [{ id: "sub-1", userId: "u-admin", plan: "pro", status: "active", country: "GH" }],
  countries: [
    {
      code: "GH",
      name: "Ghana",
      currency: "GHS",
      language: "en",
      disclaimer: "Signals are informational and not investment advice.",
      pricingPlanUsd: 5
    },
    {
      code: "KE",
      name: "Kenya",
      currency: "KES",
      language: "en",
      disclaimer: "Use simulated insights responsibly.",
      pricingPlanUsd: 6
    }
  ] as CountryConfig[],
  strategyConfig: [
    {
      strategy: "advanced_quantitative",
      enabled: true,
      country: "GH",
      parameters: { confidenceMultiplier: 1.02 }
    },
    {
      strategy: "technical_fundamental_hybrid",
      enabled: true,
      country: "GH",
      parameters: { confidenceMultiplier: 1 }
    },
    {
      strategy: "long_horizon_value",
      enabled: true,
      country: "GH",
      parameters: { confidenceMultiplier: 0.98 }
    }
  ] as StrategyConfig[],
  feedSources: [
    { id: "feed-1", type: "rss", name: "African Markets RSS", endpoint: "https://example.com/rss", enabled: true },
    { id: "feed-2", type: "api", name: "Economic Indicators API", endpoint: "https://example.com/econ", enabled: true }
  ],
  feeds: [] as FeedItem[],
  signals: [] as StrategyOutput[],
  marketDataRows: [] as Record<string, string>[],
  languagePacks: [{ code: "en", country: "GH", enabled: true }],
  regulatoryText: [{ country: "GH", content: "This platform does not custody funds." }],
  lessons: [
    {
      slug: "stock-market-basics",
      title: "What Is the Stock Market?",
      category: "Stock market basics",
      difficulty: "beginner",
      readingTimeMin: 5,
      language: "en",
      free: true,
      createdAt: "2025-01-01T00:00:00.000Z",
      content: "A stock represents a fractional ownership in a company. When you buy shares, you become a part-owner. Stock markets like the Ghana Stock Exchange (GSE), Nairobi Securities Exchange (NSE), and Nigerian Exchange (NGX) allow investors to buy and sell these shares. Prices move based on supply and demand, company performance, and broader economic factors. Understanding stocks is the first step to building an investment strategy."
    },
    {
      slug: "portfolio-diversification",
      title: "Diversifying Your Portfolio",
      category: "Portfolio diversification",
      difficulty: "beginner",
      readingTimeMin: 6,
      language: "en",
      free: true,
      createdAt: "2025-01-02T00:00:00.000Z",
      content: "Diversification means spreading investments across different companies, sectors, and asset classes. If one investment loses value, others may hold steady or gain, reducing overall risk. For example, holding a mix of banking, telecom, and energy stocks across Ghana and Kenya can smooth out country-specific downturns. A well-diversified portfolio is one of the most proven strategies for long-term wealth building."
    },
    {
      slug: "understanding-risk",
      title: "Managing Investment Risk",
      category: "Risk management",
      difficulty: "beginner",
      readingTimeMin: 7,
      language: "en",
      free: true,
      createdAt: "2025-01-03T00:00:00.000Z",
      content: "Risk is the possibility that an investment loses value. All investments carry some risk. Key risk types include market risk (overall market falls), company risk (a specific company struggles), and currency risk (exchange rate changes reduce returns). Risk management strategies include diversification, position sizing (not putting too much into one stock), and setting stop-loss levels. Higher potential returns usually come with higher risk — understanding this trade-off is essential."
    },
    {
      slug: "long-term-investing",
      title: "The Power of Long-Term Investing",
      category: "Long-term investing",
      difficulty: "beginner",
      readingTimeMin: 5,
      language: "en",
      free: true,
      createdAt: "2025-01-04T00:00:00.000Z",
      content: "Long-term investing means holding assets for years or decades. Time in the market reduces the impact of short-term volatility. Compound returns — earning returns on your returns — is the key mechanism. A $1,000 investment growing at 10% annually becomes $6,727 over 20 years. African markets have shown strong long-term growth potential despite short-term fluctuations. Patience and discipline are the investor's greatest tools."
    },
    {
      slug: "reading-market-signals",
      title: "Reading Buy, Sell & Hold Signals",
      category: "Stock market basics",
      difficulty: "intermediate",
      readingTimeMin: 8,
      language: "en",
      free: false,
      createdAt: "2025-01-05T00:00:00.000Z",
      content: "Investment signals are recommendations based on data analysis. A BUY signal suggests the price is expected to rise. A SELL signal suggests the price may fall. A HOLD signal means the current position should be maintained. Signals come with confidence scores and risk levels. At Milestone Markets, signals are generated using three strategy tiers: Advanced Quantitative, Technical-Fundamental Hybrid, and Long-Horizon Value. Always treat signals as informational tools, not guaranteed predictions."
    },
    {
      slug: "market-cycles",
      title: "Understanding Market Cycles",
      category: "Market cycles",
      difficulty: "intermediate",
      readingTimeMin: 9,
      language: "en",
      free: false,
      createdAt: "2025-01-06T00:00:00.000Z",
      content: "Markets move in cycles: expansion, peak, contraction, and trough. Recognizing where a market is in its cycle helps investors make better timing decisions. During expansion, corporate earnings grow and confidence rises. At the peak, valuations stretch. During contraction, prices fall as economic conditions weaken. At the trough, assets are undervalued — often the best time to buy for patient investors. Macro indicators like GDP growth, interest rates, and commodity prices signal these transitions."
    }
  ] as Array<{ slug: string; title: string; category: string; difficulty: string; readingTimeMin: number; language: string; free: boolean; content: string; createdAt: string }>,
  lessonProgress: [] as Array<{ userId: string; lessonSlug: string; completedAt: string }>,
  portfolios: [] as Array<{ userId: string; simulatedBalance: number; holdings: Array<{ symbol: string; qty: number; avgPrice: number }> }>,
  simulatedTrades: [] as Array<{ id: string; userId: string; symbol: string; action: "BUY" | "SELL"; qty: number; price: number; date: string; pnl?: number }>,
  stockQuotes: {
    MTN: { symbol: "MTN", name: "MTN Group", price: 180.50, change: 2.10, changePct: 1.17, currency: "ZAR" },
    KCB: { symbol: "KCB", name: "KCB Group", price: 42.75, change: -0.30, changePct: -0.70, currency: "KES" },
    DANGCEM: { symbol: "DANGCEM", name: "Dangote Cement", price: 268.00, change: 5.00, changePct: 1.90, currency: "NGN" },
    GCB: { symbol: "GCB", name: "GCB Bank", price: 5.21, change: 0.05, changePct: 0.97, currency: "GHS" },
    ECOBANK: { symbol: "ECOBANK", name: "Ecobank Transnational", price: 12.40, change: 0.20, changePct: 1.64, currency: "GHS" },
    SAFARICOM: { symbol: "SAFARICOM", name: "Safaricom PLC", price: 17.85, change: -0.15, changePct: -0.83, currency: "KES" },
    ZENITHBANK: { symbol: "ZENITHBANK", name: "Zenith Bank", price: 36.50, change: 1.20, changePct: 3.40, currency: "NGN" },
    NPN: { symbol: "NPN", name: "Naspers", price: 3640.00, change: 42.00, changePct: 1.17, currency: "ZAR" }
  } as Record<string, { symbol: string; name: string; price: number; change: number; changePct: number; currency: string }>,
  macroSnapshot: {
    GH: { inflationYoY: 16.1, fxMovePct90d: -4.8, rateDeltaBps12m: 100, commodityCycle: "neutral", policyRisk: 45 },
    KE: { inflationYoY: 6.4, fxMovePct90d: -1.6, rateDeltaBps12m: 25, commodityCycle: "up", policyRisk: 32 },
    NG: { inflationYoY: 24.8, fxMovePct90d: -9.1, rateDeltaBps12m: 200, commodityCycle: "up", policyRisk: 66 },
    ZA: { inflationYoY: 5.5, fxMovePct90d: 0.8, rateDeltaBps12m: -25, commodityCycle: "neutral", policyRisk: 28 }
  } as Record<string, { inflationYoY: number; fxMovePct90d: number; rateDeltaBps12m: number; commodityCycle: "up" | "down" | "neutral"; policyRisk: number }>,
  liquiditySnapshot: {
    MTN: { bidAskSpreadBps: 28, avgDailyVolume: 2100000, orderBookDepthUsd: 540000, volatility30d: 0.21 },
    KCB: { bidAskSpreadBps: 37, avgDailyVolume: 1350000, orderBookDepthUsd: 310000, volatility30d: 0.24 },
    DANGCEM: { bidAskSpreadBps: 44, avgDailyVolume: 920000, orderBookDepthUsd: 220000, volatility30d: 0.33 },
    GCB: { bidAskSpreadBps: 62, avgDailyVolume: 240000, orderBookDepthUsd: 80000, volatility30d: 0.35 },
    ECOBANK: { bidAskSpreadBps: 57, avgDailyVolume: 280000, orderBookDepthUsd: 92000, volatility30d: 0.31 },
    SAFARICOM: { bidAskSpreadBps: 31, avgDailyVolume: 1850000, orderBookDepthUsd: 460000, volatility30d: 0.22 },
    ZENITHBANK: { bidAskSpreadBps: 47, avgDailyVolume: 760000, orderBookDepthUsd: 200000, volatility30d: 0.29 },
    NPN: { bidAskSpreadBps: 24, avgDailyVolume: 640000, orderBookDepthUsd: 680000, volatility30d: 0.18 }
  } as Record<string, { bidAskSpreadBps: number; avgDailyVolume: number; orderBookDepthUsd: number; volatility30d: number }>,
  sentimentSnapshot: {
    MTN: { score: 62, trend: "up" },
    KCB: { score: 54, trend: "flat" },
    DANGCEM: { score: 67, trend: "up" },
    GCB: { score: 49, trend: "down" },
    ECOBANK: { score: 58, trend: "up" },
    SAFARICOM: { score: 52, trend: "flat" },
    ZENITHBANK: { score: 64, trend: "up" },
    NPN: { score: 60, trend: "up" }
  } as Record<string, { score: number; trend: "up" | "down" | "flat" }>,
  valuationSnapshot: {
    MTN: { baseFairValue: 192, uncertainty: 0.18 },
    KCB: { baseFairValue: 44.2, uncertainty: 0.22 },
    DANGCEM: { baseFairValue: 286, uncertainty: 0.2 },
    GCB: { baseFairValue: 5.4, uncertainty: 0.31 },
    ECOBANK: { baseFairValue: 13.1, uncertainty: 0.29 },
    SAFARICOM: { baseFairValue: 18.4, uncertainty: 0.2 },
    ZENITHBANK: { baseFairValue: 39.5, uncertainty: 0.24 },
    NPN: { baseFairValue: 3720, uncertainty: 0.17 }
  } as Record<string, { baseFairValue: number; uncertainty: number }>,
  marketIndexes: {
    "GSE-CI": { code: "GSE-CI", name: "Ghana Stock Exchange Composite", country: "GH", level: 3450, changePct: 0.9, components: ["GCB", "ECOBANK"] },
    "NSE-20": { code: "NSE-20", name: "Nairobi NSE 20", country: "KE", level: 1890, changePct: -0.4, components: ["KCB", "SAFARICOM"] },
    "NGX-ASI": { code: "NGX-ASI", name: "Nigerian All Share Index", country: "NG", level: 102200, changePct: 1.2, components: ["DANGCEM", "ZENITHBANK"] },
    "JSE-ALSI": { code: "JSE-ALSI", name: "Johannesburg All Share", country: "ZA", level: 77200, changePct: 0.6, components: ["MTN", "NPN"] }
  } as Record<string, { code: string; name: string; country: string; level: number; changePct: number; components: string[] }>
};

function isoDaysAgo(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
}

export function clearVisualizationData() {
  memoryStore.lessonProgress = [];
  memoryStore.portfolios = [];
  memoryStore.simulatedTrades = [];
  memoryStore.feeds = [];
  memoryStore.signals = [];
  memoryStore.marketDataRows = [];
}

export function seedVisualizationData() {
  clearVisualizationData();

  if (!memoryStore.users.find((u) => u.id === "u-demo-1")) {
    memoryStore.users.push({
      id: "u-demo-1",
      name: "Amina K.",
      email: "amina.demo@example.dev",
      role: "subscriber",
      country: "GH",
      language: "en",
      accountType: "premium",
      experienceLevel: "intermediate"
    });
  }

  if (!memoryStore.users.find((u) => u.id === "u-demo-2")) {
    memoryStore.users.push({
      id: "u-demo-2",
      name: "Nuru T.",
      email: "nuru.demo@example.dev",
      role: "subscriber",
      country: "KE",
      language: "en",
      accountType: "free",
      experienceLevel: "beginner"
    });
  }

  memoryStore.subscriptions = [
    { id: "sub-1", userId: "u-admin", plan: "pro", status: "active", country: "GH" },
    { id: "sub-demo-1", userId: "u-demo-1", plan: "pro", status: "active", country: "GH" },
    { id: "sub-demo-2", userId: "u-demo-2", plan: "starter", status: "trial", country: "KE" }
  ];

  const symbols = Object.keys(memoryStore.stockQuotes);

  memoryStore.lessonProgress.push(
    { userId: "u-admin", lessonSlug: "stock-market-basics", completedAt: isoDaysAgo(14) },
    { userId: "u-admin", lessonSlug: "portfolio-diversification", completedAt: isoDaysAgo(10) },
    { userId: "u-admin", lessonSlug: "understanding-risk", completedAt: isoDaysAgo(7) },
    { userId: "u-admin", lessonSlug: "long-term-investing", completedAt: isoDaysAgo(3) }
  );

  memoryStore.portfolios.push({
    userId: "u-admin",
    simulatedBalance: 4625.35,
    holdings: [
      { symbol: "MTN", qty: 22, avgPrice: 174.2 },
      { symbol: "GCB", qty: 520, avgPrice: 4.88 },
      { symbol: "ZENITHBANK", qty: 140, avgPrice: 31.7 },
      { symbol: "SAFARICOM", qty: 210, avgPrice: 16.42 }
    ]
  });

  memoryStore.portfolios.push({
    userId: "u-demo-1",
    simulatedBalance: 7198.1,
    holdings: [
      { symbol: "ECOBANK", qty: 160, avgPrice: 11.2 },
      { symbol: "KCB", qty: 90, avgPrice: 39.6 }
    ]
  });

  for (let i = 0; i < 64; i++) {
    const symbol = symbols[i % symbols.length];
    const quote = memoryStore.stockQuotes[symbol];
    const side = i % 3 === 0 ? "SELL" : "BUY";
    const qty = 8 + (i % 9) * 3;
    const priceDrift = 1 + ((i % 11) - 5) / 180;
    const price = Number((quote.price * priceDrift).toFixed(2));
    const pnl = side === "SELL" ? Number((((i % 8) - 3) * 18.4).toFixed(2)) : undefined;
    memoryStore.simulatedTrades.push({
      id: `vis-trade-${i + 1}`,
      userId: i % 5 === 0 ? "u-demo-1" : "u-admin",
      symbol,
      action: side,
      qty,
      price,
      date: isoDaysAgo(40 - Math.min(i, 39)),
      ...(pnl !== undefined ? { pnl } : {})
    });
  }

  const feedHeadlines = [
    "Central bank policy tone softens as inflation moderates",
    "Banking earnings beat consensus in regional update",
    "FX volatility picks up after import demand shock",
    "Telecom margin expansion supports medium-term outlook",
    "Energy distribution reform plans lift sector sentiment",
    "Liquidity improves on major exchange counters",
    "Consumer demand remains resilient despite rate pressure",
    "Cross-border payment reforms reduce settlement friction"
  ];

  memoryStore.feeds.push(
    ...feedHeadlines.map((title, idx) => ({
      id: `vis-feed-${idx + 1}`,
      source: idx % 2 === 0 ? "Markets Wire" : "Africa Business Desk",
      title,
      summary: "Synthetic development headline for dashboard and feed visualisation.",
      url: `https://example.dev/feed/${idx + 1}`,
      publishedAt: isoDaysAgo(idx),
      tags: ["macro", "markets", idx % 2 === 0 ? "policy" : "equities"],
      country: idx % 3 === 0 ? "GH" : idx % 3 === 1 ? "KE" : "NG",
      sector: idx % 2 === 0 ? "Financials" : "Telecom",
      symbol: symbols[idx % symbols.length],
      sentiment: Number((0.15 + ((idx % 5) - 2) * 0.12).toFixed(2))
    }))
  );

  memoryStore.signals.push(
    ...symbols.slice(0, 8).map((symbol, idx) => ({
      strategy: idx % 3 === 0 ? "advanced_quantitative" : idx % 3 === 1 ? "technical_fundamental_hybrid" : "long_horizon_value",
      action: idx % 4 === 0 ? "BUY" : idx % 4 === 1 ? "HOLD" : "SELL",
      confidence: 52 + idx * 5,
      risk: idx % 4 === 0 ? "LOW" : idx % 4 === 1 ? "MEDIUM" : "HIGH",
      explanation: "Development-only synthetic signal for interface visualisation.",
      symbol,
      country: idx % 2 === 0 ? "GH" : "ZA",
      generatedAt: isoDaysAgo(idx)
    }))
  );

  for (let day = 0; day < 90; day++) {
    const ref = memoryStore.stockQuotes.GCB.price * (1 + ((day % 13) - 6) / 250);
    const open = Number((ref * (1 - 0.01 + (day % 3) * 0.004)).toFixed(3));
    const close = Number((ref * (1 + 0.012 - (day % 4) * 0.003)).toFixed(3));
    const high = Number((Math.max(open, close) * 1.013).toFixed(3));
    const low = Number((Math.min(open, close) * 0.987).toFixed(3));
    memoryStore.marketDataRows.push({
      symbol: "GCB",
      timeframe: "1D",
      date: isoDaysAgo(90 - day).slice(0, 10),
      open: String(open),
      high: String(high),
      low: String(low),
      close: String(close),
      volume: String(220000 + (day % 10) * 14500)
    });
  }

  return {
    users: memoryStore.users.length,
    subscriptions: memoryStore.subscriptions.length,
    lessonProgress: memoryStore.lessonProgress.length,
    portfolios: memoryStore.portfolios.length,
    simulatedTrades: memoryStore.simulatedTrades.length,
    feeds: memoryStore.feeds.length,
    signals: memoryStore.signals.length,
    marketDataRows: memoryStore.marketDataRows.length
  };
}
