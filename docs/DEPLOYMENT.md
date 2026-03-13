# Deployment

## Local Development
1. npm install
2. npm run dev

Services:
- Public website: http://localhost:3000
- Admin console: http://localhost:3001
- API: http://localhost:8080

## Docker Compose
1. docker compose -f infra/docker-compose.yml up --build
2. Access services via configured ports

## Environment Variables
API:
- PORT
- JWT_SECRET

Admin/Web:
- NEXT_PUBLIC_API_URL

## Production Notes
- Put API behind reverse proxy and TLS
- Move in-memory stores to PostgreSQL and Redis
- Set up centralized logs and metrics (Prometheus + Grafana or cloud equivalent)
- Configure per-country legal text approval workflow
