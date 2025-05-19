#!/bin/bash

# Build the server Docker image
echo "Building server Docker image..."
docker build -t mintflow-server -f Dockerfile.server .

# Check if the build was successful
if [ $? -eq 0 ]; then
  echo "Build successful! You can run the server with:"
  echo "docker run -p 3000:3000 mintflow-server"
else
  echo "Build failed. Please check the error messages above."
fi
