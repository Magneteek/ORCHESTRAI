# Multi-stage build for Facebook Ads Manager Next.js application
# Optimized for production deployment with minimal image size

# ============================================
# Stage 1: Dependencies (Base)
# ============================================
FROM node:18.20.0-alpine AS base

# Install dependencies only when needed
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ============================================
# Stage 2: Dependencies Installation
# ============================================
FROM base AS deps

# Copy package files
COPY frontend/package.json frontend/package-lock.json* ./
COPY package.json package-lock.json* ../

# Install dependencies
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Install dev dependencies for build
RUN npm ci --ignore-scripts

# ============================================
# Stage 3: Builder
# ============================================
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ ./

# Copy Prisma schema
COPY frontend/prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Environment variables for build
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_FACEBOOK_APP_ID
ARG NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_FACEBOOK_APP_ID=$NEXT_PUBLIC_FACEBOOK_APP_ID
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN npm run build

# ============================================
# Stage 4: Production Runner
# ============================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy built application (standalone mode)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and client
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Health check script
COPY --chown=nextjs:nodejs scripts/healthcheck.sh ./healthcheck.sh
RUN chmod +x ./healthcheck.sh

USER nextjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
