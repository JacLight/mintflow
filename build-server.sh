#!/bin/bash

# Extract version from package.json
VERSION=$(grep '"version"' packages/server/package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[:space:]')
IMAGE_NAME="mintflow/server"
TAG="$VERSION"

echo "Building Docker image ${IMAGE_NAME}:${TAG} for multiple platforms..."

# Build for AMD64 architecture
echo "Building for AMD64 platform..."
docker build \
  --platform=linux/amd64 \
  -t ${IMAGE_NAME}:${TAG}-amd64 \
  -f Dockerfile.server \
  .

# Build for ARM64 architecture (Apple Silicon)
echo "Building for ARM64 platform (Apple Silicon)..."
docker build \
  --platform=linux/arm64 \
  -t ${IMAGE_NAME}:${TAG}-arm64 \
  -f Dockerfile.server \
  .

# Tag as latest for both architectures
docker tag ${IMAGE_NAME}:${TAG}-amd64 ${IMAGE_NAME}:latest-amd64
docker tag ${IMAGE_NAME}:${TAG}-arm64 ${IMAGE_NAME}:latest-arm64

# Check if the builds were successful
if [ $? -eq 0 ]; then
  echo "Builds successful!"
  echo "You can run the server with:"
  echo "docker run -p 7001:7001 ${IMAGE_NAME}:${TAG}-amd64  # For AMD64 systems"
  echo "docker run -p 7001:7001 ${IMAGE_NAME}:${TAG}-arm64  # For ARM64 systems (Apple Silicon)"
  echo "This will start the server on port 7001."

  # Push images to Docker Hub
  echo "Pushing Docker images to Docker Hub..."
  docker push ${IMAGE_NAME}:${TAG}-amd64
  docker push ${IMAGE_NAME}:${TAG}-arm64
  docker push ${IMAGE_NAME}:latest-amd64
  docker push ${IMAGE_NAME}:latest-arm64

  echo "Creating and pushing multi-arch manifest for version tag..."
  docker manifest create ${IMAGE_NAME}:${TAG} \
    --amend ${IMAGE_NAME}:${TAG}-amd64 \
    --amend ${IMAGE_NAME}:${TAG}-arm64
  docker manifest push ${IMAGE_NAME}:${TAG}

  echo "Creating and pushing multi-arch manifest for latest tag..."
  docker manifest create ${IMAGE_NAME}:latest \
    --amend ${IMAGE_NAME}:latest-amd64 \
    --amend ${IMAGE_NAME}:latest-arm64
  docker manifest push ${IMAGE_NAME}:latest

  echo "All images and manifests pushed successfully!"
else
  echo "Build failed. Please check the error messages above."
fi
