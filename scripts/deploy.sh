#!/usr/bin/env bash
set -euo pipefail

echo "Building Milestone Markets services..."
docker compose -f infra/docker-compose.yml build

echo "Starting services..."
docker compose -f infra/docker-compose.yml up -d

echo "Deployment complete"
echo "Web: http://localhost:3000"
echo "Admin: http://localhost:3001"
echo "API: http://localhost:8080"
