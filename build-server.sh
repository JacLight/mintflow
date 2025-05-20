#!/bin/bash
echo "Building server Docker image..."
echo "Building all packages..."
# pnpm nx run-many --target=build --all


# Extract version from package.json
VERSION=$(grep '"version"' packages/server/package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[:space:]')
IMAGE_NAME="jaclight/fundu"
TAG="mintflow-server-${VERSION}"

IMAGE_NAME="jaclight/fundu"
TAG="builder-dev-0.0.2"
docker build -f Dockerfile.server -t $IMAGE_NAME:$TAG .

echo "Building Docker image ${IMAGE_NAME}:${TAG} for AMD64..."

# Build only for AMD64 with the custom tag
docker build \
  --platform=linux/amd64 \
  -t ${IMAGE_NAME}:${TAG} \
  -f Dockerfile.server \
  .

# Build for ARM64 architecture (Apple Silicon)
echo "Building Docker image ${IMAGE_NAME}:${TAG}-arm64 for ARM64 platform..."
docker build \
  --platform=linux/arm64 \
  -t ${IMAGE_NAME}:${TAG}-arm64 \
  -f Dockerfile.server \
  .

# Check if the build was successful
if [ $? -eq 0 ]; then
  echo "Build successful!"
  echo "Pushing Docker image to Docker Hub..."
  docker push ${IMAGE_NAME}:${TAG}
  echo "Image ${IMAGE_NAME}:${TAG} pushed successfully!"
else
  echo "Build failed. Please check the error messages above."
fi
