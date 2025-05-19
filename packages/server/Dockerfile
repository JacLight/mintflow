# Docker build for Node server
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Copy TypeScript configuration
COPY tsconfig.json ./
COPY ../../tsconfig.base.json /tsconfig.base.json

# Create directory structure and copy common package
RUN mkdir -p /packages/common

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY ../../packages/common /packages/common

# Build the application
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/index.js"]
