export type Role = "admin" | "analyst" | "operator" | "subscriber";

export type StrategyName =
  | "advanced_quantitative"
  | "technical_fundamental_hybrid"
  | "long_horizon_value";

export type ActionSignal = "BUY" | "SELL" | "HOLD";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface StrategyOutput {
  strategy: StrategyName;
  action: ActionSignal;
  confidence: number;
  risk: RiskLevel;
  explanation: string;
  symbol: string;
  country: string;
  generatedAt: string;
}

export interface StrategyConfig {
  strategy: StrategyName;
  enabled: boolean;
  country: string;
  parameters: Record<string, number | string | boolean>;
}

export interface SignalInput {
  symbol: string;
  country: string;
  timeframeDays: number;
  marketFeatures: Record<string, number>;
  sentimentScore?: number;
}

export interface SimulationRequest {
  startingCapital: number;
  strategy: StrategyName;
  periodDays: number;
  country: string;
  symbols: string[];
}

export interface SimTrade {
  date: string;
  symbol: string;
  action: ActionSignal;
  quantity: number;
  price: number;
  pnl: number;
}

export interface SimulationResult {
  startingCapital: number;
  currentValue: number;
  growthPct: number;
  tradeHistory: SimTrade[];
  chartSeries: Array<{ date: string; value: number }>;
  whatsappChartUrl: string;
}

export interface FeedItem {
  id: string;
  source: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  tags: string[];
  country: string;
  sector?: string;
  symbol?: string;
  sentiment: number;
}

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  language: string;
  disclaimer: string;
  pricingPlanUsd: number;
}
