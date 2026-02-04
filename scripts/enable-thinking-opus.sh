#!/bin/bash

# Enable Extended Thinking for Opus-tier agents
AGENTS_DIR="/Users/kris/CLAUDEtools/ORCHESTRAI/.claude/agents"

echo "🧠 Enabling Extended Thinking for Opus-tier agents..."
echo ""

# Function to add thinking config to an agent
add_thinking() {
  local file=$1
  local budget=$2
  local agent_name=$(basename "$file" .md)

  # Check if thinking already exists
  if grep -q "^thinking:" "$file"; then
    echo "✓ $agent_name (already configured)"
    return
  fi

  # Find line number of second ---
  end_line=$(awk '/^---$/ {count++; if (count==2) {print NR; exit}}' "$file")

  if [ -z "$end_line" ]; then
    echo "⚠️  $agent_name (no frontmatter found)"
    return
  fi

  # Create temp file with thinking config
  head -n $((end_line-1)) "$file" > "${file}.tmp"
  echo "thinking:" >> "${file}.tmp"
  echo "  enabled: true" >> "${file}.tmp"
  echo "  budget: ${budget}" >> "${file}.tmp"
  tail -n +${end_line} "$file" >> "${file}.tmp"

  # Replace original
  mv "${file}.tmp" "$file"

  echo "✅ $agent_name (budget: ${budget})"
}

# High complexity agents - 10000 token budget
for agent in financial-modeling-specialist ai-project-predictor \
             advanced-performance-analyzer semantic-analysis-engine \
             performance-forecasting-specialist crystalline-memory-optimizer; do
  [ -f "$AGENTS_DIR/${agent}.md" ] && add_thinking "$AGENTS_DIR/${agent}.md" 10000
done

# Medium complexity agents - 8000 token budget
for agent in orchestrai-master-coordinator client-project-orchestrator \
             intelligent-risk-assessor simultaneous-orchestrator \
             vaibe-builder-orchestrator; do
  [ -f "$AGENTS_DIR/${agent}.md" ] && add_thinking "$AGENTS_DIR/${agent}.md" 8000
done

echo ""
echo "🎉 Extended thinking configuration complete!"
