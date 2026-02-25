#!/bin/bash

# GBP Automation Development Server Starter
# This script starts both the API server and UI development server

echo "🚀 Starting GBP Automation Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if database exists
if [ ! -f "database/gbp-posts.db" ]; then
  echo -e "${BLUE}ℹ️  Database not found. Initializing...${NC}"
  npm run init
  echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${BLUE}ℹ️  Installing backend dependencies...${NC}"
  npm install
  echo ""
fi

# Check if UI node_modules exists
if [ ! -d "ui/node_modules" ]; then
  echo -e "${BLUE}ℹ️  Installing UI dependencies...${NC}"
  cd ui && npm install --legacy-peer-deps && cd ..
  echo ""
fi

echo -e "${GREEN}✨ Starting servers...${NC}"
echo ""
echo "📊 API Server: http://localhost:3001"
echo "🎨 UI Dashboard: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start both servers in parallel
trap 'kill 0' EXIT
npm run server & npm run ui

wait
