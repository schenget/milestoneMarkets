# Milestone Markets

Milestone Markets is a multi-channel investment insights and stock-signal platform by Milestonecraft Investments.

## Core Capabilities
- Stock market insights
- Buy/Sell/Hold signals with confidence and risk scoring
- Portfolio simulation engine
- Feed aggregation and sentiment scoring
- Multi-country country config, pricing, language, and disclaimers
- Low-tech channel support: WhatsApp, USSD, SMS, 2G web
- Future trading architecture placeholders (no execution)

## Project Structure
- apps/api: Backend API and channel handlers
- apps/admin: Admin console
- apps/web: Public SEO website
- packages/*: Shared engines and integration abstractions
- database/schema.sql: Core relational schema
- docs/: Architecture, API, and deployment documentation
- infra/: Docker and compose assets
- scripts/deploy.sh: deployment helper

## Quick Start
1. npm install
2. npm run dev

## Important Constraint
Milestone Markets does not hold user funds. It provides informational insights and simulations only.
