#!/bin/bash

# Monitor deletereviews.nl DataForSEO Crawl Status
# Task ID: 10291318-8161-0216-0000-1d9d23d22aba

TASK_ID="10291318-8161-0216-0000-1d9d23d22aba"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  deletereviews.nl Crawl Monitor${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Task ID:${NC} $TASK_ID"
echo -e "${CYAN}Target:${NC} https://deletereviews.nl"
echo ""

check_status() {
  echo -e "${YELLOW}⏳ Checking crawl status...${NC}"
  echo ""

  # Note: This script is a placeholder showing what WOULD be checked
  # Actual status checking must be done via Claude Code MCP tools

  echo -e "${CYAN}To check status, ask Claude Code to execute:${NC}"
  echo ""
  echo "mcp__dataforseo__onpage_summary({"
  echo "  id: \"$TASK_ID\""
  echo "})"
  echo ""
  echo -e "${YELLOW}Status Codes:${NC}"
  echo "  40602 = Task In Queue (waiting to start)"
  echo "  40601 = Task Processing (actively crawling)"
  echo "  20000 = Complete (results ready)"
  echo ""
}

show_retrieval_commands() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}Once Complete, Retrieve Results:${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  echo -e "${CYAN}1. Summary (issues overview):${NC}"
  echo "   mcp__dataforseo__onpage_summary({ id: \"$TASK_ID\" })"
  echo ""

  echo -e "${CYAN}2. All crawled pages:${NC}"
  echo "   mcp__dataforseo__onpage_pages({ id: \"$TASK_ID\", limit: 300 })"
  echo ""

  echo -e "${CYAN}3. Pages with errors (4xx, 5xx):${NC}"
  echo "   mcp__dataforseo__onpage_pages({"
  echo "     id: \"$TASK_ID\","
  echo "     filters: [\"status_code\", \">=\", 400]"
  echo "   })"
  echo ""

  echo -e "${CYAN}4. Duplicate meta tags:${NC}"
  echo "   mcp__dataforseo__onpage_duplicate_tags({ id: \"$TASK_ID\" })"
  echo ""

  echo -e "${CYAN}5. Redirect chains:${NC}"
  echo "   mcp__dataforseo__onpage_redirect_chains({ id: \"$TASK_ID\" })"
  echo ""

  echo -e "${CYAN}6. Non-indexable pages:${NC}"
  echo "   mcp__dataforseo__onpage_non_indexable({ id: \"$TASK_ID\" })"
  echo ""

  echo -e "${CYAN}7. Resources (images, CSS, JS):${NC}"
  echo "   mcp__dataforseo__onpage_resources({ id: \"$TASK_ID\", limit: 500 })"
  echo ""

  echo -e "${CYAN}8. Internal links:${NC}"
  echo "   mcp__dataforseo__onpage_links({ id: \"$TASK_ID\", limit: 500 })"
  echo ""
}

show_agent_command() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}Automated Analysis (Recommended):${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${CYAN}Use ORCHESTRAI's seo-technical-analysis agent:${NC}"
  echo ""
  echo "Task({"
  echo "  subagent_type: \"seo-technical-analysis\","
  echo "  prompt: \`"
  echo "    Analyze DataForSEO crawl results for deletereviews.nl"
  echo ""
  echo "    Task ID: $TASK_ID"
  echo ""
  echo "    Please:"
  echo "    1. Retrieve complete audit data using all relevant MCP tools"
  echo "    2. Identify critical technical SEO issues"
  echo "    3. Categorize issues by severity (critical, high, medium, low)"
  echo "    4. Prioritize fixes by impact and effort"
  echo "    5. Create actionable implementation plan with code examples"
  echo "    6. Generate comprehensive technical SEO audit report"
  echo ""
  echo "    Save deliverables to appropriate project folders."
  echo "  \`"
  echo "})"
  echo ""
}

# Main execution
check_status
show_retrieval_commands
show_agent_command

echo -e "${YELLOW}💡 Tip:${NC} Crawling 300 pages with browser rendering takes 15-30 minutes"
echo -e "${YELLOW}💡 Tip:${NC} Check back in 20 minutes for results"
echo ""
echo -e "${GREEN}✅ Save this task ID:${NC} $TASK_ID"
echo ""
