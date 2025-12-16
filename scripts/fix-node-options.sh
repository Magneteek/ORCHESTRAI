#!/bin/bash

##
# Fix NODE_OPTIONS Environment Variable
# Removes invalid --gc-interval flag that causes Node.js to fail
##

echo "🔧 Fixing NODE_OPTIONS environment variable..."
echo ""

# Check current NODE_OPTIONS
if [ -n "$NODE_OPTIONS" ]; then
    echo "Current NODE_OPTIONS: $NODE_OPTIONS"
    echo ""
fi

# Remove --gc-interval from NODE_OPTIONS if present
export NODE_OPTIONS="--max-old-space-size=4096"

echo "✅ Fixed NODE_OPTIONS: $NODE_OPTIONS"
echo ""
echo "📝 Note: This fix is temporary for this session"
echo "   To make it permanent, update your shell configuration:"
echo ""
echo "   Add to ~/.zshrc or ~/.bashrc:"
echo "   export NODE_OPTIONS=\"--max-old-space-size=4096\""
echo ""
echo "   Then run: source ~/.zshrc"
echo ""

# Test if node works now
echo "🧪 Testing Node.js with fixed options..."
if node -e "console.log('✅ Node.js is working!')" 2>&1; then
    echo ""
    echo "✅ Fix successful! You can now run ORCHESTRAI commands."
else
    echo ""
    echo "❌ Node.js still has issues. Please check your environment."
fi
