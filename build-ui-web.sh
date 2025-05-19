#!/bin/bash

set -e

# Navigate to the script's directory (project root)
cd "$(dirname "$0")"

# Set the UI Web package path
UI_WEB_PATH="packages/ui-web"

# Extract version from the correct package.json
if [ ! -f "$UI_WEB_PATH/package.json" ]; then
  echo "Error: $UI_WEB_PATH/package.json not found!" >&2
  exit 1
fi
VERSION=$(grep '"version"' $UI_WEB_PATH/package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[:space:]')
if [ -z "$VERSION" ]; then
  echo "Error: Could not extract version from $UI_WEB_PATH/package.json" >&2
  exit 1
fi
IMAGE_NAME="mintflow/ui-web"
TAG="$VERSION"

# Build context is the project root, Dockerfile is at root
DOCKERFILE="Dockerfile.ui-web"

# Build for AMD64 architecture
echo "Building Docker image ${IMAGE_NAME}:${TAG}-amd64 for AMD64 platform..."
docker build \
  --platform=linux/amd64 \
  -t ${IMAGE_NAME}:${TAG}-amd64 \
  -f $DOCKERFILE \
  .

# Build for ARM64 architecture (Apple Silicon)
echo "Building Docker image ${IMAGE_NAME}:${TAG}-arm64 for ARM64 platform..."
docker build \
  --platform=linux/arm64 \
  -t ${IMAGE_NAME}:${TAG}-arm64 \
  -f $DOCKERFILE \
  .

docker tag ${IMAGE_NAME}:${TAG}-amd64 ${IMAGE_NAME}:latest-amd64
docker tag ${IMAGE_NAME}:${TAG}-arm64 ${IMAGE_NAME}:latest-arm64

echo "Builds successful!"
echo "You can run the UI Web with:"
echo "docker run -p 3600:3600 ${IMAGE_NAME}:${TAG}-amd64  # For AMD64 systems"
echo "docker run -p 3600:3600 ${IMAGE_NAME}:${TAG}-arm64  # For ARM64 systems (Apple Silicon)"
echo "This will start the UI Web on port 3600."
