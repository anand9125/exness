# Build from repo root: docker build -f apps/server/Dockerfile .
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps apps
COPY packages packages
RUN npm ci

WORKDIR /app/apps/server
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/server/package.json ./
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/index.js"]
