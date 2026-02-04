#!/bin/bash

# Enable Extended Thinking for all 12 Opus-tier agents
# Adds thinking configuration to agent frontmatter

AGENTS_DIR="/Users/kris/CLAUDEtools/ORCHESTRAI/.claude/agents"

# Define thinking budgets per agent (based on complexity)
declare -A THINKING_BUDGETS=(
  ["strategic-plan-synthesizer"]=10000      # Already done
  ["financial-modeling-specialist"]=10000    # Complex financial analysis
  ["ai-project-predictor"]=10000             # Predictive modeling
  ["advanced-performance-analyzer"]=10000     # Performance analysis
  ["semantic-analysis-engine"]=10000          # Semantic reasoning
  ["performance-forecasting-specialist"]=10000 # Forecasting
  ["crystalline-memory-optimizer"]=10000      # Memory optimization
  ["orchestrai-master-coordinator"]=8000      # Coordination (less deep reasoning)
  ["client-project-orchestrator"]=8000        # Project orchestration
  ["intelligent-risk-assessor"]=8000          # Risk assessment
  ["simultaneous-orchestrator"]=8000          # Parallel coordination
  ["vaibe-builder-orchestrator"]=8000         # Builder orchestration
)

echo "🧠 Enabling Extended Thinking for Opus-tier agents..."
echo ""

for agent in "${!THINKING_BUDGETS[@]}"; do
  file="$AGENTS_DIR/${agent}.md"
  budget=${THINKING_BUDGETS[$agent]}

  if [ ! -f "$file" ]; then
    echo "⚠️  Agent not found: $agent"
    continue
  fi

  # Check if thinking config already exists
  if grep -q "^thinking:" "$file"; then
    echo "✓ $agent (thinking already configured)"
    continue
  fi

  # Find the line number where frontmatter ends (second ---)
  end_line=$(awk '/^---$/ {count++; if (count==2) {print NR; exit}}' "$file")

  if [ -z "$end_line" ]; then
    echo "⚠️  Could not find frontmatter end in $agent"
    continue
  fi

  # Insert thinking configuration before the closing ---
  sed -i '' "${end_line}i\\
thinking:\\
  enabled: true\\
  budget: ${budget}\\
" "$file"

  echo "✅ $agent (budget: ${budget} tokens)"
done

echo ""
echo "🎉 Extended thinking enabled for all Opus agents!"
echo ""
echo "Next steps:"
echo "1. Update orchestrator to use ThinkingEnabledClient"
echo "2. Test with one agent to verify thinking output"
echo "3. Monitor thinking token usage and quality improvements"
