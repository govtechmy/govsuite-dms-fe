#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
IMAGE_NAME="govsuite-dms-fe"
IMAGE_TAG="latest"

case "$(uname -m)" in
  x86_64|amd64)
    ARCH="amd64"
    ;;
  aarch64|arm64)
    ARCH="arm64"
    ;;
  *)
    echo "❌ Error: unsupported architecture $(uname -m)"
    exit 1
    ;;
esac
TAR_FILE="$SCRIPT_DIR/frontend-$ARCH.tar"

echo "🔍 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
  echo "❌ Error: docker is not installed or not in PATH"
  exit 1
fi

if ! docker ps &> /dev/null; then
  echo "❌ Error: docker daemon is not running or not accessible"
  exit 1
fi

if ! docker compose version &> /dev/null; then
  echo "❌ Error: docker compose (v2 plugin) is not installed or not in PATH"
  exit 1
fi

if [ ! -f "$TAR_FILE" ]; then
  echo "❌ Error: $(basename "$TAR_FILE") not found at $TAR_FILE"
  echo "   Make sure to copy $(basename "$TAR_FILE") to the same directory as this script"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: .env not found at $ENV_FILE"
  echo "   Copy .env.example to .env and fill in your values"
  exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "❌ Error: docker-compose.yml not found at $COMPOSE_FILE"
  exit 1
fi

echo "✓ All prerequisites met"
echo ""

echo "📦 Loading frontend image from $TAR_FILE..."
docker load -i "$TAR_FILE"
docker tag "$IMAGE_NAME:$IMAGE_TAG-$ARCH" "$IMAGE_NAME:$IMAGE_TAG"
echo "✓ Image loaded successfully"
echo ""

echo "🚀 Starting frontend with docker compose..."
cd "$SCRIPT_DIR"
docker compose -f "$COMPOSE_FILE" --profile production up -d

echo ""
echo "⏳ Waiting for frontend to be healthy..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  HEALTH_STATUS=$(docker compose -f "$COMPOSE_FILE" --profile production ps -q frontend 2>/dev/null | xargs -r docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "none")

  if [ "$HEALTH_STATUS" = "healthy" ]; then
    echo "✓ Frontend is healthy"
    break
  elif [ "$HEALTH_STATUS" = "starting" ] || [ "$HEALTH_STATUS" = "none" ]; then
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "  Status: $HEALTH_STATUS... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 1
  else
    echo "❌ Frontend health check failed: $HEALTH_STATUS"
    docker compose -f "$COMPOSE_FILE" logs frontend
    exit 1
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "⚠️  Timeout waiting for frontend health check, but container may still be starting"
  echo "   Check status manually with: docker compose -f $COMPOSE_FILE --profile production ps"
  exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
docker compose -f "$COMPOSE_FILE" --profile production ps
echo ""
echo "Frontend is available at:"
echo "  http://localhost"
