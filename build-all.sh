#!/bin/bash

echo "Building both server and UI Web Docker images..."

# Build server
echo "=== Building Server ==="
./build-server.sh

# Check if server build was successful
if [ $? -ne 0 ]; then
  echo "Server build failed. Stopping."
  exit 1
fi

echo ""
echo "=== Building UI Web ==="
./build-ui-web.sh

# Check if UI Web build was successful
if [ $? -ne 0 ]; then
  echo "UI Web build failed."
  exit 1
fi

echo ""
echo "All builds completed successfully!"
echo "You can run the server with:"
echo "docker run -p 7001:7001 mintflow/server:$(grep '"version"' packages/server/package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[:space:]')-amd64"
echo ""
echo "You can run the UI Web with:"
echo "docker run -p 3600:3600 mintflow/ui-web:$(grep '"version"' ui-web/package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[:space:]')-amd64"
