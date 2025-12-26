# ZacAi Script Registry - Quick Reference

## One-Time Setup

```bash
bash /workspaces/ZacAi-System-Core/scripts/setup.sh
source ~/.bashrc  # or ~/.zshrc
```

## How It Works

**Zero modifications needed.** Just run scripts normally:

```bash
bash deploy.sh
python3 migrate.py  
cargo build
npm install
```

↓ Automatically detected, hashed, and registered ↓

## Key Commands

| Command | Purpose |
|---------|---------|
| `zac-script-stats` | Show registry statistics |
| `zac-verify-scripts` | Verify integrity (detect tampering) |
| `zac-register-script "cmd"` | Manually register a script |

## Registry Locations

```
/workspaces/ZacAi-System-Core/scripts/
├── registry.json      ← Central registry (JSON)
├── source/            ← User-created scripts
├── detected/          ← Auto-detected from terminal
└── vendor/            ← Third-party scripts
```

## Why Hospital-Grade?

✓ **Audit Trail**: Every command timestamped and logged  
✓ **Integrity**: SHA-256 checksums detect tampering  
✓ **Recovery**: Auto-detected scripts can replay for recovery  
✓ **Compliance**: Full compliance logging for regulations  
✓ **Transparency**: Complete visibility into script execution  

## Auto-Detection Features

- ✓ **Automatic**: No code changes needed
- ✓ **Non-intrusive**: ~2-5ms overhead per command
- ✓ **Persistent**: Survives shell restart
- ✓ **Recoverable**: Scripts backed up for self-repair
- ✓ **Verified**: Checksums ensure integrity

## Example: View Statistics

```bash
$ zac-script-stats

📊 ZacAi Script Registry Statistics
====================================
{
  "totalScripts": 28,
  "totalExecutions": 142,
  "byCategory": {
    "source": 5,
    "detected": 20,
    "vendor": 3
  },
  "successRate": "96.48%",
  "lastUpdated": "2025-12-26T06:18:00Z"
}
```

## Example: Verify Integrity

```bash
$ zac-verify-scripts

🔍 Verifying script integrity...
  ✓ deploy.sh
  ✓ backup.sh
  ✗ suspicious.sh (MODIFIED - potential security issue!)
  ✓ migrate.py
```

## Folder Structure

### `source/` - Your Scripts
User-created scripts with metadata:
```
source/
├── deploy.sh
├── backup.sh
└── cleanup.sh
```

### `detected/` - Auto-Captured
Scripts detected from terminal:
```
detected/
├── a7f3d2e1c9b4f5a8.sh    (bash my-script.sh)
├── b2e4c6f8a1d3e5g9.sh    (python3 migrate.py)
└── c9h5i7j2k4l6m8n1.sh    (npm install)
```

### `vendor/` - External Scripts
Third-party packages:
```
vendor/
├── terraform-apply.sh
└── kubectl-deploy.sh
```

## Real-World Use Cases

### 1. Self-Repair
```bash
# System detects degradation
if health-check-failed; then
  # Replay script from registry
  bash scripts/detected/recovery-HASH.sh
fi
```

### 2. Audit Compliance
```bash
# Show all scripts run by user
cat scripts/registry.json | jq '.entries[] | select(.status=="success")'
```

### 3. Threat Detection
```bash
# Check for suspicious activity
zac-verify-scripts  # Detects modified scripts
```

### 4. Performance Analysis
```bash
# Find slow/failing scripts
cat scripts/registry.json | jq '.entries[] | select(.status=="failed")'
```

## Advanced: Custom Metadata

Register source script with metadata:

```bash
# 1. Create your script
cat > scripts/source/backup.sh << 'EOF'
#!/bin/bash
set -euo pipefail
echo "Backing up..."
pg_dump mydb | gzip > backup.sql.gz
EOF

# 2. Register with metadata
node scripts/registry-manager.ts register scripts/source/backup.sh

# 3. System now tracks:
# - When it runs
# - Success/failure
# - Execution count
# - Integrity hash
# - Custom purpose/criticality
```

## Troubleshooting

**Q: Auto-detection not working?**  
A: Verify setup: `echo $ZAC_AI_ROOT` should print `/workspaces/ZacAi-System-Core`

**Q: Can I disable it?**  
A: Comment out line in `~/.bashrc`: `# source /workspaces/...`

**Q: Will it slow me down?**  
A: No, overhead is ~2-5ms per command (negligible)

**Q: Can I delete detected scripts?**  
A: Yes, but registry remembers them (for audit trail)

## Architecture Design

```
┌─── Your Terminal ───┐
│  bash deploy.sh     │  ← You run any script
└──────────┬──────────┘
           │
           ↓
    ┌──────────────┐
    │ Bash Trap    │  ← PROMPT_COMMAND hook
    │ Intercepts   │
    └──────┬───────┘
           │
           ↓
    ┌──────────────────────┐
    │ • Hash script        │
    │ • Save to detected/  │
    │ • Update registry    │
    │ • Log metadata       │
    └──────┬───────────────┘
           │
           ↓
    ┌──────────────────────┐
    │ scripts/detected/    │
    │ scripts/registry.json│  ← System of record
    └──────────────────────┘
```

## Next Steps

1. Run setup: `bash scripts/setup.sh`
2. Reload shell: `source ~/.bashrc`
3. Run scripts normally (auto-detection works)
4. Check stats: `zac-script-stats`
5. Verify integrity: `zac-verify-scripts`

---

**Questions?** See [SCRIPT_REGISTRY.md](SCRIPT_REGISTRY.md) for complete documentation.
