# ---- BASE NODE IMAGE ----
FROM node:22-alpine

# ---- SETUP WORKING DIR ----
WORKDIR /app/packages/server

# ---- COPY DEPENDENCIES ----
COPY packages/server/package.json ./
COPY packages/server/tsconfig.json ./
COPY tsconfig.base.json /app/tsconfig.base.json

# ---- INSTALL DEPENDENCIES ----
RUN npm install

# ---- COPY SOURCE ----
COPY packages/server/src ./src
COPY packages/common /app/packages/common

# ---- BUILD ----
RUN npm run build

# ---- EXPOSE & RUN ----
EXPOSE 7001
CMD ["node", "dist/index.js"]
