#!/bin/bash
#
# ZacAi Script Registry System - Quick Setup
# Hospital-grade script tracking in 60 seconds
#

set -euo pipefail

echo "🚀 ZacAi Script Registry Setup"
echo "=============================="
echo ""

# Detect shell
if [[ -f ~/.bashrc ]]; then
    RC_FILE=~/.bashrc
    SHELL_NAME="bash"
elif [[ -f ~/.zshrc ]]; then
    RC_FILE=~/.zshrc
    SHELL_NAME="zsh"
else
    echo "❌ Neither ~/.bashrc nor ~/.zshrc found"
    exit 1
fi

echo "📝 Shell detected: $SHELL_NAME"
echo ""

# Check if already initialized
if grep -q "shell-init.sh" "$RC_FILE" 2>/dev/null; then
    echo "✓ Auto-detection already enabled in $RC_FILE"
else
    echo "📍 Enabling auto-detection..."
    echo "" >> "$RC_FILE"
    echo "# ZacAi Script Registry Auto-Detection" >> "$RC_FILE"
    echo "source /workspaces/ZacAi-System-Core/.env/shell-init.sh" >> "$RC_FILE"
    echo "✓ Added to $RC_FILE"
fi

echo ""
echo "✓ Setup complete!"
echo ""
echo "To activate now, run:"
echo "  source $RC_FILE"
echo ""
echo "Available commands:"
echo "  zac-script-stats    - Show registry statistics"
echo "  zac-verify-scripts  - Verify script integrity"
echo "  zac-register-script - Manually register a script"
echo ""
echo "📚 For more info: cat /workspaces/ZacAi-System-Core/SCRIPT_REGISTRY.md"
