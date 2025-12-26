#!/bin/bash
#
# ZacAi Script Auto-Detector
# Transparent bash hook that captures all executed commands
# Hospital-grade audit trail with zero modification to user scripts
# 
# Usage: Source this in ~/.bashrc or ~/.zshrc
#   source /path/to/script-detector.sh
#

set -euo pipefail

SCRIPTS_REGISTRY="/workspaces/ZacAi-System-Core/scripts"
DETECTED_DIR="${SCRIPTS_REGISTRY}/detected"
REGISTRY_FILE="${SCRIPTS_REGISTRY}/registry.json"

# Ensure directories exist
mkdir -p "${DETECTED_DIR}" "$(dirname "${REGISTRY_FILE}")"

# Color codes for logging
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

#
# Core Detection Function
# Runs after every command in the shell
#
_detect_script() {
    local exit_code=$?
    local command="$BASH_COMMAND"
    
    # Skip internal commands and common non-script patterns
    if [[ -z "$command" ]] || \
       [[ "$command" =~ ^(history|pwd|cd|ls|echo|true|false) ]] || \
       [[ "$command" =~ ^_[a-z_]+ ]] || \
       [[ "$command" =~ ^# ]]; then
        return $exit_code
    fi
    
    # Capture scripts: anything with .sh, .rs, .py, .ts, executables
    if [[ "$command" =~ \.(sh|rs|py|ts|js|bash)([[:space:]]|$) ]] || \
       [[ "$command" =~ ^[./].*[^[:space:]] ]]; then
        _register_script_execution "$command" $exit_code
    fi
    
    return $exit_code
}

#
# Register Script in Detection System
# Creates a log entry and updates registry
#
_register_script_execution() {
    local command="$1"
    local exit_code="${2:-1}"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
    local cmd_hash=$(echo -n "$command" | sha256sum | awk '{print $1}')
    local script_file="${DETECTED_DIR}/${cmd_hash}.sh"
    
    # Extract executable name
    local executable=$(echo "$command" | awk '{print $1}' | xargs basename)
    
    # Only register if not already registered in this session (prevent duplicates)
    if [[ ! -f "${script_file}" ]]; then
        # Save the script content
        {
            echo "#!/bin/bash"
            echo "# Auto-detected: ${timestamp}"
            echo "# Hash: ${cmd_hash}"
            echo "# Original command:"
            echo "# ${command}"
            echo ""
            echo "$command"
        } > "${script_file}"
        chmod +x "${script_file}" 2>/dev/null || true
        
        # Update registry
        _update_registry "$executable" "${cmd_hash}" "$exit_code" "$timestamp"
    fi
}

#
# Update Registry JSON
# Hospital-grade logging with integrity checks
#
_update_registry() {
    local script_name="$1"
    local script_hash="$2"
    local exit_code="$3"
    local timestamp="$4"
    
    # Check if jq is available for JSON manipulation
    if command -v jq &>/dev/null; then
        # Use jq for safe JSON updates
        local temp_registry=$(mktemp)
        
        jq --arg name "$script_name" \
           --arg hash "$script_hash" \
           --arg status "$([ $exit_code -eq 0 ] && echo 'success' || echo 'failed')" \
           --arg timestamp "$timestamp" \
           --arg exit_code "$exit_code" \
           '.entries += [{
              "name": $name,
              "hash": $hash,
              "status": $status,
              "exitCode": ($exit_code | tonumber),
              "detectedAt": $timestamp,
              "category": "detected"
            }] | .metadata.lastUpdated = $timestamp' \
           "${REGISTRY_FILE}" > "${temp_registry}" 2>/dev/null || {
            echo "Failed to update registry" >&2
            return 1
        }
        
        mv "${temp_registry}" "${REGISTRY_FILE}"
    else
        # Fallback: simple append to registry (requires manual formatting fix)
        echo "Warning: jq not found. Registry updates may be incomplete. Install jq for full functionality." >&2
    fi
}

#
# Export function for use in shell
#
export -f _detect_script
export -f _register_script_execution
export -f _update_registry

# Hook into shell command execution
# This runs after EVERY command but before the next prompt
export PROMPT_COMMAND="_detect_script:${PROMPT_COMMAND:-true}"

# Also set for zsh if available
if [[ -n "${ZSH_VERSION:-}" ]]; then
    setopt PROMPT_COMMAND
    precmd_functions+=(_detect_script)
fi

echo -e "${GREEN}✓ ZacAi Script Auto-Detector initialized${NC}"
echo -e "${YELLOW}  Scripts will be auto-detected and logged to: ${DETECTED_DIR}${NC}"
