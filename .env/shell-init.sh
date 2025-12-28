#!/bin/bash
#
# ZacAi System Core - Shell Configuration Setup
# Enables automatic script detection and registry updates
#
# Add this to ~/.bashrc or ~/.zshrc to enable auto-detection:
#   source /workspaces/ZacAi-System-Core/.env/shell-init.sh
#

# Detect if running in bash or zsh
if [[ -n "${BASH_VERSION:-}" ]]; then
    SHELL_TYPE="bash"
    RC_FILE="$HOME/.bashrc"
elif [[ -n "${ZSH_VERSION:-}" ]]; then
    SHELL_TYPE="zsh"
    RC_FILE="$HOME/.zshrc"
else
    SHELL_TYPE="unknown"
fi

export ZAC_AI_ROOT="${ZAC_AI_ROOT:-/workspaces/ZacAi-System-Core}"
export ZAC_SCRIPTS="${ZAC_AI_ROOT}/scripts"
export ZAC_REGISTRY="${ZAC_SCRIPTS}/registry.json"

# Source the script detector
if [[ -f "${ZAC_SCRIPTS}/script-detector.sh" ]]; then
    source "${ZAC_SCRIPTS}/script-detector.sh"
fi

# Helper function: register a script after running it
# Usage: zac-register-script "script-name" "exit-code"
zac-register-script() {
    local script_name="${1:-unknown}"
    local exit_code="${2:-0}"
    
    if command -v node &>/dev/null; then
        node -e "
            const { ScriptRegistry } = require('${ZAC_SCRIPTS}/registry-manager.ts');
            const registry = new ScriptRegistry();
            registry.registerDetected('${script_name}', ${exit_code});
            registry.save();
        " 2>/dev/null || true
    fi
}

# Helper function: show script statistics
zac-script-stats() {
    if command -v jq &>/dev/null; then
        echo "📊 ZacAi Script Registry Statistics"
        echo "===================================="
        jq '.metadata' "${ZAC_REGISTRY}"
        echo ""
        echo "Scripts by Category:"
        jq '.scripts' "${ZAC_REGISTRY}"
    else
        cat "${ZAC_REGISTRY}" | python3 -m json.tool
    fi
}

# Helper function: verify script integrity
zac-verify-scripts() {
    if command -v node &>/dev/null; then
        echo "🔍 Verifying script integrity..."
        node "${ZAC_SCRIPTS}/registry-manager.ts" verify
    else
        echo "Node.js not found. Cannot verify scripts." >&2
    fi
}

# Export functions
export -f zac-register-script
export -f zac-script-stats
export -f zac-verify-scripts

# Show initialization message
if [[ "${ZAC_AI_INIT_SHOWN:-}" != "true" ]]; then
    echo "✓ ZacAi System initialized"
    echo "  Available commands:"
    echo "    zac-script-stats    - Show registry statistics"
    echo "    zac-verify-scripts  - Verify script integrity"
    echo "    zac-register-script - Manually register a script"
    export ZAC_AI_INIT_SHOWN=true
fi
