# Build from repo root: docker build -f apps/ws/Dockerfile .
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps apps
COPY packages packages
RUN npm ci

WORKDIR /app/apps/ws
RUN npm install
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/ws/package.json ./
COPY --from=builder /app/apps/ws/node_modules ./node_modules
COPY --from=builder /app/apps/ws/dist ./dist
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/index.js"]
