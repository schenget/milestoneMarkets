import { memoryStore } from "../../shared/store.js";

export interface MacroRegimeOutput {
  regime: "high_inflation" | "fx_stress" | "stable_growth" | "policy_shock";
  riskLevel: "low" | "medium" | "high";
  expectedConditions: string[];
  riskScore: number;
}

export interface LiquidityOutput {
  liquidityScore: number;
  slippageEstimatePct: number;
  txCostEstimatePct: number;
  truePrice: number;
  warnings: string[];
}

export interface RealTechnicalOutput {
  realPrice: number;
  realMovingAvg20: number;
  realRsi14: number;
  realMomentum20dPct: number;
}

export interface ScenarioValuationOutput {
  fairValueRange: { low: number; base: number; high: number };
  scenarioProbabilities: { bear: number; base: number; bull: number };
  upsideDownsidePct: { bear: number; base: number; bull: number };
  probabilityWeightedFairValue: number;
}

export interface BayesianValuationOutput {
  posteriorFairValue: number;
  confidenceInterval95: { low: number; high: number };
  uncertaintyScore: number;
}

export interface SentimentOutput {
  score: number;
  trend: "up" | "down" | "flat";
  riskAlerts: string[];
}

export interface MlPredictionOutput {
  nextPeriodReturnPct: number;
  confidenceScore: number;
  riskClass: "defensive" | "balanced" | "aggressive";
}

export interface CompositeOutput {
  score: number;
  riskLabel: "low" | "medium" | "high";
  action: "BUY" | "HOLD" | "SELL";
  explanation: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function macroRegimeEngine(country: string): MacroRegimeOutput {
  const macro = memoryStore.macroSnapshot[country] ?? memoryStore.macroSnapshot.GH;
  const inflationRisk = clamp((macro.inflationYoY - 5) * 2, 0, 35);
  const fxRisk = clamp(Math.abs(Math.min(macro.fxMovePct90d, 0)) * 3, 0, 30);
  const policyRisk = clamp(macro.policyRisk * 0.35, 0, 35);
  const riskScore = Math.round(clamp(inflationRisk + fxRisk + policyRisk, 0, 100));

  let regime: MacroRegimeOutput["regime"] = "stable_growth";
  if (macro.inflationYoY >= 12) regime = "high_inflation";
  if (macro.fxMovePct90d <= -6) regime = "fx_stress";
  if (macro.policyRisk > 60) regime = "policy_shock";

  const riskLevel = riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";
  const expectedConditions: string[] = [];
  if (regime === "high_inflation") expectedConditions.push("Valuation compression risk", "Nominal gains may overstate real returns");
  if (regime === "fx_stress") expectedConditions.push("Imported-cost pressure", "FX volatility affecting earnings quality");
  if (regime === "policy_shock") expectedConditions.push("Policy uncertainty", "Higher discount-rate sensitivity");
  if (regime === "stable_growth") expectedConditions.push("Earnings stability", "Lower macro drawdown risk");

  return { regime, riskLevel, expectedConditions, riskScore };
}

export function liquidityMicrostructureEngine(symbol: string): LiquidityOutput {
  const quote = memoryStore.stockQuotes[symbol];
  const liq = memoryStore.liquiditySnapshot[symbol];
  if (!quote || !liq) {
    return {
      liquidityScore: 45,
      slippageEstimatePct: 0.7,
      txCostEstimatePct: 0.95,
      truePrice: quote?.price ?? 0,
      warnings: ["Limited liquidity data available"]
    };
  }

  const spreadPenalty = clamp(liq.bidAskSpreadBps / 1.4, 0, 40);
  const depthBoost = clamp(liq.orderBookDepthUsd / 20000, 0, 40);
  const volPenalty = clamp(liq.volatility30d * 70, 0, 25);
  const liquidityScore = Math.round(clamp(20 + depthBoost - spreadPenalty - volPenalty, 0, 100));

  const slippageEstimatePct = +clamp((100 - liquidityScore) / 120, 0.05, 2.2).toFixed(2);
  const txCostEstimatePct = +clamp(slippageEstimatePct + liq.bidAskSpreadBps / 10000, 0.08, 2.7).toFixed(2);
  const truePrice = +(quote.price * (1 + slippageEstimatePct / 100)).toFixed(4);

  const warnings: string[] = [];
  if (slippageEstimatePct > 1) warnings.push("High slippage risk");
  if (liq.bidAskSpreadBps > 55) warnings.push("Wide spread, execution may be expensive");
  if (liq.avgDailyVolume < 300000) warnings.push("Thin volume, use smaller position sizing");

  return { liquidityScore, slippageEstimatePct, txCostEstimatePct, truePrice, warnings };
}

export function inflationAdjustedTechnicalEngine(symbol: string, country: string): RealTechnicalOutput {
  const quote = memoryStore.stockQuotes[symbol];
  const macro = memoryStore.macroSnapshot[country] ?? memoryStore.macroSnapshot.GH;
  const inflationFactor = 1 + macro.inflationYoY / 100;
  const realPrice = +(quote.price / inflationFactor).toFixed(4);
  const realMovingAvg20 = +(realPrice * (1 - macro.fxMovePct90d / 1000)).toFixed(4);
  const realMomentum20dPct = +(((realPrice - realMovingAvg20) / Math.max(realMovingAvg20, 0.0001)) * 100).toFixed(2);
  const realRsi14 = clamp(50 + realMomentum20dPct * 2.2, 5, 95);
  return { realPrice, realMovingAvg20, realRsi14: +realRsi14.toFixed(2), realMomentum20dPct };
}

export function scenarioValuationEngine(symbol: string): ScenarioValuationOutput {
  const quote = memoryStore.stockQuotes[symbol];
  const val = memoryStore.valuationSnapshot[symbol] ?? { baseFairValue: quote.price * 1.04, uncertainty: 0.25 };

  const low = +(val.baseFairValue * (1 - val.uncertainty)).toFixed(2);
  const high = +(val.baseFairValue * (1 + val.uncertainty)).toFixed(2);
  const base = +val.baseFairValue.toFixed(2);

  const scenarioProbabilities = { bear: 0.25, base: 0.5, bull: 0.25 };
  const upsideDownsidePct = {
    bear: +(((low - quote.price) / quote.price) * 100).toFixed(2),
    base: +(((base - quote.price) / quote.price) * 100).toFixed(2),
    bull: +(((high - quote.price) / quote.price) * 100).toFixed(2)
  };

  const probabilityWeightedFairValue = +(low * scenarioProbabilities.bear + base * scenarioProbabilities.base + high * scenarioProbabilities.bull).toFixed(2);
  return { fairValueRange: { low, base, high }, scenarioProbabilities, upsideDownsidePct, probabilityWeightedFairValue };
}

export function bayesianValuationEngine(symbol: string): BayesianValuationOutput {
  const quote = memoryStore.stockQuotes[symbol];
  const val = memoryStore.valuationSnapshot[symbol] ?? { baseFairValue: quote.price, uncertainty: 0.25 };
  const prior = quote.price;
  const posterior = +(prior * 0.35 + val.baseFairValue * 0.65).toFixed(2);
  const ciSpread = +(posterior * (0.08 + val.uncertainty * 0.35)).toFixed(2);
  const low = +(posterior - ciSpread).toFixed(2);
  const high = +(posterior + ciSpread).toFixed(2);
  const uncertaintyScore = Math.round(clamp((high - low) / posterior * 50, 5, 100));
  return { posteriorFairValue: posterior, confidenceInterval95: { low, high }, uncertaintyScore };
}

export function alternativeDataSentimentEngine(symbol: string): SentimentOutput {
  const sentiment = memoryStore.sentimentSnapshot[symbol] ?? { score: 50, trend: "flat" as const };
  const riskAlerts: string[] = [];
  if (sentiment.score < 40) riskAlerts.push("Negative sentiment pressure");
  if (sentiment.trend === "down") riskAlerts.push("Momentum of sentiment is weakening");
  if (sentiment.score > 70) riskAlerts.push("Sentiment overheating risk");
  return { score: sentiment.score, trend: sentiment.trend, riskAlerts };
}

export function mlPredictionEngine(symbol: string, country: string): MlPredictionOutput {
  const macro = macroRegimeEngine(country);
  const liq = liquidityMicrostructureEngine(symbol);
  const sentiment = alternativeDataSentimentEngine(symbol);
  const quote = memoryStore.stockQuotes[symbol];

  const returnBase = quote.changePct * 0.35 + (sentiment.score - 50) * 0.06 + (liq.liquidityScore - 50) * 0.02 - macro.riskScore * 0.015;
  const nextPeriodReturnPct = +clamp(returnBase, -8, 8).toFixed(2);
  const confidenceScore = Math.round(clamp(68 - macro.riskScore * 0.4 + liq.liquidityScore * 0.25, 20, 92));
  const riskClass = confidenceScore > 70 ? "defensive" : confidenceScore > 45 ? "balanced" : "aggressive";

  return { nextPeriodReturnPct, confidenceScore, riskClass };
}

export function compositeSignalEngine(symbol: string, country: string): CompositeOutput {
  const macro = macroRegimeEngine(country);
  const liq = liquidityMicrostructureEngine(symbol);
  const technical = inflationAdjustedTechnicalEngine(symbol, country);
  const scenario = scenarioValuationEngine(symbol);
  const bayesian = bayesianValuationEngine(symbol);
  const sentiment = alternativeDataSentimentEngine(symbol);
  const ml = mlPredictionEngine(symbol, country);

  const score = Math.round(
    clamp(
      35 +
        sentiment.score * 0.18 +
        liq.liquidityScore * 0.2 +
        clamp(technical.realMomentum20dPct + 50, 0, 100) * 0.14 +
        clamp(ml.nextPeriodReturnPct * 5 + 50, 0, 100) * 0.18 +
        clamp(scenario.upsideDownsidePct.base + 50, 0, 100) * 0.12 +
        clamp(100 - bayesian.uncertaintyScore, 0, 100) * 0.08 -
        macro.riskScore * 0.25,
      0,
      100
    )
  );

  const riskLabel = score >= 67 ? "low" : score >= 40 ? "medium" : "high";
  const action: CompositeOutput["action"] = score >= 68 ? "BUY" : score <= 35 ? "SELL" : "HOLD";
  const explanation = `Composite ${score}/100 driven by macro regime (${macro.regime}), liquidity (${liq.liquidityScore}), sentiment (${sentiment.score}), and valuation confidence (${100 - bayesian.uncertaintyScore}).`;

  return { score, riskLabel, action, explanation };
}

export function fullCompanyAnalysis(symbol: string, country: string) {
  return {
    symbol,
    country,
    quote: memoryStore.stockQuotes[symbol],
    macroRegime: macroRegimeEngine(country),
    liquidity: liquidityMicrostructureEngine(symbol),
    inflationAdjustedTechnical: inflationAdjustedTechnicalEngine(symbol, country),
    scenarioValuation: scenarioValuationEngine(symbol),
    bayesianValuation: bayesianValuationEngine(symbol),
    sentiment: alternativeDataSentimentEngine(symbol),
    mlPrediction: mlPredictionEngine(symbol, country),
    composite: compositeSignalEngine(symbol, country)
  };
}

export function marketAnalysis(country: string) {
  const symbols = Object.keys(memoryStore.stockQuotes).filter((s) => {
    const c = memoryStore.stockQuotes[s].currency;
    return (
      (country === "GH" && c === "GHS") ||
      (country === "KE" && c === "KES") ||
      (country === "NG" && c === "NGN") ||
      (country === "ZA" && c === "ZAR")
    );
  });

  const macro = macroRegimeEngine(country);
  const liquidityScores = symbols.map((s) => liquidityMicrostructureEngine(s).liquidityScore);
  const avgLiquidityScore = liquidityScores.length ? Math.round(liquidityScores.reduce((a, b) => a + b, 0) / liquidityScores.length) : 0;

  const compositeScores = symbols.map((s) => compositeSignalEngine(s, country).score);
  const avgCompositeScore = compositeScores.length ? Math.round(compositeScores.reduce((a, b) => a + b, 0) / compositeScores.length) : 0;

  return {
    country,
    macroRegime: macro,
    coverageSymbols: symbols,
    averageLiquidityScore: avgLiquidityScore,
    averageCompositeScore: avgCompositeScore,
    marketRiskLabel: avgCompositeScore >= 65 ? "constructive" : avgCompositeScore >= 45 ? "neutral" : "defensive"
  };
}

export function indexAnalysis(indexCode: string) {
  const index = memoryStore.marketIndexes[indexCode];
  if (!index) return null;
  const componentAnalyses = index.components.map((s) => ({ symbol: s, composite: compositeSignalEngine(s, index.country) }));
  const aggregate = Math.round(componentAnalyses.reduce((acc, a) => acc + a.composite.score, 0) / Math.max(componentAnalyses.length, 1));
  return {
    ...index,
    macroRegime: macroRegimeEngine(index.country),
    componentAnalyses,
    indexCompositeScore: aggregate,
    direction: aggregate >= 65 ? "bullish" : aggregate <= 40 ? "bearish" : "range-bound"
  };
}
