const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const chooseAction = (score) => {
    if (score >= 65)
        return "BUY";
    if (score <= 40)
        return "SELL";
    return "HOLD";
};
const riskFromConfidence = (confidence) => {
    if (confidence >= 75)
        return "LOW";
    if (confidence >= 55)
        return "MEDIUM";
    return "HIGH";
};
export class StrategyEngine {
    run(input, config) {
        const byStrategy = {
            advanced_quantitative: this.advancedQuantitative,
            technical_fundamental_hybrid: this.technicalFundamentalHybrid,
            long_horizon_value: this.longHorizonValue
        };
        return byStrategy[config.strategy](input, config);
    }
    advancedQuantitative = (input, config) => {
        const f = input.marketFeatures;
        const sentiment = input.sentimentScore ?? 50;
        const vol = f.volatility ?? 50;
        const momentum = f.momentum ?? 50;
        const mlProbability = (f.mlProbability ?? 0.5) * 100;
        const score = clamp(0.4 * mlProbability + 0.25 * momentum + 0.2 * sentiment + 0.15 * (100 - vol));
        const confidence = clamp(score * (Number(config.parameters.confidenceMultiplier ?? 1)));
        return {
            strategy: "advanced_quantitative",
            action: chooseAction(score),
            confidence,
            risk: riskFromConfidence(confidence),
            explanation: "Advanced Quantitative Strategy combines machine learning probability, sentiment and volatility-adjusted momentum to identify short-term opportunities.",
            symbol: input.symbol,
            country: input.country,
            generatedAt: new Date().toISOString()
        };
    };
    technicalFundamentalHybrid = (input, config) => {
        const f = input.marketFeatures;
        const rsi = f.rsi ?? 50;
        const macd = f.macd ?? 0;
        const pe = f.pe ?? 15;
        const debtToEquity = f.debtToEquity ?? 1;
        const liquidity = f.liquidityScore ?? 50;
        const technical = clamp((100 - Math.abs(50 - rsi) * 2) * 0.45 + clamp(macd * 10 + 50) * 0.25 + liquidity * 0.3);
        const fundamental = clamp((30 - pe) * 2 + (2 - debtToEquity) * 20 + 50);
        const score = clamp(technical * 0.55 + fundamental * 0.45);
        const confidence = clamp(score * Number(config.parameters.confidenceMultiplier ?? 1));
        return {
            strategy: "technical_fundamental_hybrid",
            action: chooseAction(score),
            confidence,
            risk: riskFromConfidence(confidence),
            explanation: "Technical-Fundamental Hybrid Strategy blends RSI, MACD, liquidity and valuation quality filters to balance timing and business quality.",
            symbol: input.symbol,
            country: input.country,
            generatedAt: new Date().toISOString()
        };
    };
    longHorizonValue = (input, config) => {
        const f = input.marketFeatures;
        const dividendConsistency = f.dividendConsistency ?? 50;
        const beta = f.beta ?? 1;
        const earningsStability = f.earningsStability ?? 50;
        const macroAlignment = f.macroAlignment ?? 50;
        const score = clamp(dividendConsistency * 0.35 +
            clamp((1.5 - beta) * 40 + 50) * 0.2 +
            earningsStability * 0.25 +
            macroAlignment * 0.2);
        const confidence = clamp(score * Number(config.parameters.confidenceMultiplier ?? 1));
        return {
            strategy: "long_horizon_value",
            action: chooseAction(score),
            confidence,
            risk: riskFromConfidence(confidence),
            explanation: "Long-Horizon Value Strategy emphasizes dividend reliability, lower volatility and macro-consistent earnings resilience for durable compounding.",
            symbol: input.symbol,
            country: input.country,
            generatedAt: new Date().toISOString()
        };
    };
}
