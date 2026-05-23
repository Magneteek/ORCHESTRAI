FROM node:18-alpine

RUN apk add --no-cache curl

# /app
# ├── orchestrai-trigger-system/   ← trigger system code
# └── orchestrai-session-manager/  ← session capture (require('../orchestrai-session-manager'))
WORKDIR /app

# Install trigger system dependencies
COPY orchestrai-trigger-system/package*.json ./orchestrai-trigger-system/
RUN cd orchestrai-trigger-system && npm ci --production

# Copy both packages (session-manager has zero runtime deps)
COPY orchestrai-trigger-system/ ./orchestrai-trigger-system/
COPY orchestrai-session-manager/ ./orchestrai-session-manager/

# Create volume mount points
RUN mkdir -p /app/sessions /app/logs

WORKDIR /app/orchestrai-trigger-system

EXPOSE 5502

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5502/health || exit 1

CMD ["node", "server.js"]
