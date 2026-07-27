#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_DIR="$HOME/Desktop/govsuite-fe-deploy"
IMAGE_NAME="govsuite-dms-fe"
IMAGE_TAG="latest"

echo "🔍 Checking docker..."

if ! command -v docker &> /dev/null; then
  echo "❌ Error: docker is not installed or not in PATH"
  exit 1
fi

if ! docker ps &> /dev/null; then
  echo "❌ Error: docker daemon is not running or not accessible"
  exit 1
fi

if ! docker buildx version &> /dev/null; then
  echo "❌ Error: docker buildx is not installed or not in PATH"
  exit 1
fi

echo "✓ Docker is available"
echo ""

ARCHES=("amd64" "arm64")

if [ ! -f "$SCRIPT_DIR/.env" ]; then
  echo "❌ Error: .env not found at $SCRIPT_DIR/.env"
  echo "   Copy .env.example to .env and fill in your values"
  exit 1
fi

echo "📁 Preparing $DEST_DIR..."
if [ -d "$DEST_DIR" ]; then
  echo "   Existing folder found, clearing it out..."
  rm -rf "$DEST_DIR"
fi
mkdir -p "$DEST_DIR"
echo "✓ Folder ready"
echo ""

for ARCH in "${ARCHES[@]}"; do
  echo "🔨 Building $IMAGE_NAME:$IMAGE_TAG for linux/$ARCH..."
  docker buildx build --platform "linux/$ARCH" -t "$IMAGE_NAME:$IMAGE_TAG-$ARCH" --load "$SCRIPT_DIR"
  echo "✓ Image built and tagged as $IMAGE_NAME:$IMAGE_TAG-$ARCH"
  echo ""

  echo "🛡️  Scanning $IMAGE_NAME:$IMAGE_TAG-$ARCH for known CVEs..."
  if docker scout version &> /dev/null; then
    docker scout cves "$IMAGE_NAME:$IMAGE_TAG-$ARCH" --only-severity critical,high --only-fixed || true
    echo "   (scan complete — review any findings above; packaging continues regardless)"
  else
    echo "⚠️  docker scout not available, skipping CVE scan"
    echo "   Install Docker Desktop or the docker-scout CLI plugin to enable automated CVE scanning"
  fi
  echo ""

  echo "💾 Saving image to $DEST_DIR/frontend-$ARCH.tar..."
  docker save "$IMAGE_NAME:$IMAGE_TAG-$ARCH" -o "$DEST_DIR/frontend-$ARCH.tar"
  echo "✓ Image saved"
  echo ""
done

echo "📋 Copying deployment files..."
cp "$SCRIPT_DIR/deploy.sh" "$DEST_DIR/"
cp "$SCRIPT_DIR/docker-compose.yml" "$DEST_DIR/"
cp "$SCRIPT_DIR/.env" "$DEST_DIR/"
chmod +x "$DEST_DIR/deploy.sh"
echo "✓ Files copied"
echo ""

TOTAL_SIZE=$(du -sh "$DEST_DIR" | cut -f1)
echo "✅ Package complete!"
echo "   Location: $DEST_DIR"
echo "   Size: $TOTAL_SIZE"
echo ""
echo "Next steps:"
echo "  1. Copy the entire '$DEST_DIR' folder to your pendrive"
echo "  2. On the target machine, run: ./deploy.sh"
