# Milestone Markets API

Base URL (local): http://localhost:8080

## Authentication
- POST /api/auth/request-otp
- POST /api/auth/verify-otp

## Strategy Engine
- GET /api/strategies/config
- PUT /api/strategies/config
- POST /api/signals/generate

Signal response:
- action: BUY | SELL | HOLD
- confidence: 0-100
- risk: LOW | MEDIUM | HIGH
- explanation: plain-language reason

## Portfolio Simulation
- POST /api/simulation/run

Returns:
- currentValue
- growthPct
- tradeHistory
- chartSeries
- whatsappChartUrl

## Feed Aggregation
- GET /api/feeds/items
- POST /api/feeds/ingest
- GET /api/feeds/sources
- POST /api/feeds/sources

Features in engine:
- normalization
- deduplication
- sentiment scoring
- tagging and country context
- alerts for high-sentiment items

## Multi-Channel Delivery
- POST /api/channels/whatsapp/webhook
- POST /api/channels/ussd/session
- POST /api/channels/sms/inbound

## Admin Console Endpoints
- GET /api/admin/dashboard
- GET /api/users
- GET /api/subscriptions
- GET /api/countries
- POST /api/countries
- GET /api/admin/language-packs
- POST /api/admin/language-packs
- GET /api/admin/regulatory-text
- PUT /api/admin/regulatory-text

## Integration Framework
- GET /api/integrations/status

Adapters include:
- WhatsApp Cloud API
- USSD gateway
- SMS aggregator
- Mobile money APIs: M-Pesa, MTN, Airtel, EcoCash
- Airtime billing
- News/RSS/Exchange connectors
- Future broker API placeholder

## Trading Architecture Placeholder
- POST /api/trading/orders
- GET /api/trading/wallets/:accountId

Trading execution is intentionally disabled in this phase.
