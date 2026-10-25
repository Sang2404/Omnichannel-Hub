# ═══════════════════════════════════════════════════════════════
# Multi-stage Dockerfile for Omnichannel Social Commerce Hub
# Stage 1: Build Backend (TypeScript → JavaScript)
# Stage 2: Build Frontend (Vite → Static Assets)
# Stage 3: Production Runtime
# ═══════════════════════════════════════════════════════════════

# ──── Stage 1: Build Backend ────
FROM node:20-alpine AS backend-build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && \
    cp -R node_modules prod_node_modules && \
    npm ci --ignore-scripts

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN npm run build

# ──── Stage 2: Build Frontend ────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --ignore-scripts

COPY frontend/ ./
RUN npm run build

# ──── Stage 3: Production Runtime ────
FROM node:20-alpine AS production
WORKDIR /app

# Install only production dependencies
COPY --from=backend-build /app/prod_node_modules ./node_modules
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/prisma ./prisma
COPY --from=backend-build /app/node_modules/.prisma ./node_modules/.prisma

# Copy frontend static build
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Copy configuration files
COPY package.json ./

# Environment Variables (override via docker-compose or .env file)
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/server.js"]
