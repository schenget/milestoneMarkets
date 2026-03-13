# Milestone Markets Architecture

## Product Identity
- Company: Milestonecraft Investments
- Platform: Milestone Markets
- Scope: insights, signals, simulation, feeds, and channel delivery
- Explicit non-custodial model: no holding client funds

## Monorepo Layout
- apps/api: API-first backend and channel webhooks
- apps/admin: web admin console
- apps/web: SEO public website
- packages/strategy-engine: three-tier signal engine
- packages/feed-engine: feed normalization, dedupe, sentiment
- packages/integration-framework: adapter abstraction
- packages/trading-placeholder: future trading interface stubs
- database/schema.sql: relational schema baseline

## Strategy Tiers
1. Advanced Quantitative Strategy
2. Technical-Fundamental Hybrid Strategy
3. Long-Horizon Value Strategy

Each strategy is:
- modular
- country-aware
- configurable by admin
- plain-language explainable

## Multi-Country Model
Country table stores:
- language
- currency
- disclaimer text
- pricing defaults

## Low-Tech Delivery Model
- WhatsApp bot webhook integration
- USSD session endpoint
- SMS inbound command endpoint
- 2G web optimized page delivery

## Future Trading Architecture
Placeholders provided for:
- trading API abstraction
- order routing interface
- compliance hook integration
- virtual wallet structure
- audit logging model

No live trading logic is implemented.
