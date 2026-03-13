import { v4 as uuid } from "uuid";
const positiveWords = ["growth", "record", "profit", "beat", "upgrade", "expansion", "bullish"];
const negativeWords = ["loss", "downgrade", "fraud", "fine", "bearish", "drop", "risk"];
export class FeedEngine {
    cache = new Map();
    normalize(raw) {
        const text = `${raw.title} ${raw.summary}`.toLowerCase();
        let score = 0;
        for (const word of positiveWords)
            if (text.includes(word))
                score += 0.12;
        for (const word of negativeWords)
            if (text.includes(word))
                score -= 0.12;
        return {
            id: uuid(),
            source: raw.source,
            title: raw.title,
            summary: raw.summary,
            url: raw.url,
            publishedAt: raw.publishedAt,
            tags: raw.tags ?? [],
            country: raw.country,
            sector: raw.sector,
            symbol: raw.symbol,
            sentiment: Math.max(-1, Math.min(1, Number(score.toFixed(2))))
        };
    }
    deduplicate(items) {
        const seen = new Set();
        return items.filter((item) => {
            const key = `${item.title.toLowerCase().trim()}::${item.source.toLowerCase().trim()}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    }
    upsert(items) {
        for (const item of items)
            this.cache.set(item.id, item);
        return this.list();
    }
    list(country) {
        const all = Array.from(this.cache.values()).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
        return country ? all.filter((f) => f.country === country) : all;
    }
}
