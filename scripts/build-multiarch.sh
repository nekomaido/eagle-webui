#!/bin/bash
set -e

# Get version from package.json
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "2.1.1")
IMAGE="nekomaido/eagle-webui"

echo "🔨 Building multi-architecture Docker image..."
echo "Version: ${VERSION}"
echo "Platforms: linux/amd64, linux/arm64"
echo ""

# Check if docker-buildx is installed
echo "📦 Checking buildx availability..."
if ! command -v docker-buildx &> /dev/null; then
  echo "❌ docker-buildx is not installed."
  echo ""
  echo "Install it with:"
  echo "  brew install docker-buildx"
  echo ""
  exit 1
fi

# Verify buildx is working
echo "✅ buildx installed"
docker-buildx version

# Build and push versioned tag
echo ""
echo "🏗️  Building and pushing ${IMAGE}:${VERSION}..."
docker-buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ${IMAGE}:${VERSION} \
  --push \
  .

# Build and push latest tag
echo "🏷️  Building and pushing ${IMAGE}:latest..."
docker-buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ${IMAGE}:latest \
  --push \
  .

echo ""
echo "✅ Multi-arch build complete!"
echo ""
echo "Image: ${IMAGE}:${VERSION}"
echo "Image: ${IMAGE}:latest"
echo ""
echo "Verify with:"
echo "  docker buildx imagetools inspect ${IMAGE}:${VERSION}"
echo "  docker buildx imagetools inspect ${IMAGE}:latest"
