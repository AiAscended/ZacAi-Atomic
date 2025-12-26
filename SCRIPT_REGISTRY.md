# ZacAi Script Registry & Auto-Detection System

## Overview

A **hospital-grade script tracking, detection, and registry system** that automatically logs all scripts executed in your terminal. Zero modifications needed to your scripts.

### Why This System?

1. **Audit Trail & Compliance**: Every command is timestamped, hashed, and logged for regulatory compliance (HIPAA, SOC2)
2. **Self-Diagnostics & Repair**: System can replay scripts for troubleshooting and automated recovery
3. **Threat Detection**: Detect anomalous script execution patterns
4. **Performance Analysis**: Track script execution frequency and success rates
5. **Reproducibility**: Recreate exact environment and script history
6. **Integrity Verification**: SHA-256 checksums ensure scripts aren't modified unexpectedly

---

## Architecture

### Directory Structure

```
scripts/
├── registry.json           # Central registry with all metadata
├── source/                 # User-created scripts
├── detected/               # Auto-detected scripts from terminal
├── vendor/                 # Third-party / external scripts
├── script-detector.sh      # Bash hook for auto-detection
└── registry-manager.ts     # TypeScript utility for registry ops
```

### How It Works

**NO modifications needed to your scripts.** The system works automatically:

```
┌─ You run: bash deploy.sh ──┐
│                             │
└──> Bash trap intercepts ───┐
     command execution        │
                             ├──> Hash script (SHA-256)
                             │
                             ├──> Save to scripts/detected/
                             │
└──> Update registry.json ───┴──> Log metadata
                                  (timestamp, exit code, etc.)
```

---

## Setup & Configuration

### 1. Enable Auto-Detection

Add this to your `~/.bashrc` or `~/.zshrc`:

```bash
source /workspaces/ZacAi-System-Core/.env/shell-init.sh
```

Then reload:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

### 2. No Script Modifications Needed

Just run scripts normally:

```bash
bash my-script.sh
python3 migrate.py
cargo build --release
```

The system **automatically detects and registers them**.

---

## Registry Format

### registry.json Structure

```json
{
  "version": "1.0.0",
  "metadata": {
    "createdAt": "2025-12-26T00:00:00Z",
    "lastUpdated": "2025-12-26T01:23:45Z",
    "systemName": "ZacAi System Core",
    "totalScripts": 42,
    "totalExecutions": 156
  },
  "scripts": {
    "source": ["deploy.sh", "backup.sh"],
    "detected": ["npm install", "git commit -am"],
    "vendor": ["cargo build"]
  },
  "entries": [
    {
      "id": "a7f3d2e1...",
      "name": "deploy.sh",
      "hash": "a7f3d2e1c9b4f5a8...",
      "category": "detected",
      "status": "success",
      "exitCode": 0,
      "detectedAt": "2025-12-26T01:23:45Z",
      "lastExecuted": "2025-12-26T01:23:45Z",
      "executionCount": 5,
      "integrity": {
        "algorithm": "sha256",
        "checksum": "a7f3d2e1c9b4f5a8...",
        "verified": true
      },
      "metadata": {
        "criticality": "high",
        "purpose": "Production deployment"
      }
    }
  ]
}
```

---

## Usage

### Automatic Detection (No Action Needed)

Just run scripts normally. They're auto-detected:

```bash
bash install-dependencies.sh
# ✓ Automatically registered in registry.json
# ✓ Saved to scripts/detected/
# ✓ Integrity hash computed
```

### Manual Registration (Optional)

To explicitly register a source script with metadata:

```bash
node scripts/registry-manager.ts register scripts/source/my-script.sh
```

### View Statistics

```bash
zac-script-stats
```

Output:
```
📊 ZacAi Script Registry Statistics
====================================
{
  "totalScripts": 42,
  "totalExecutions": 156,
  "byCategory": {
    "source": 8,
    "detected": 28,
    "vendor": 6
  },
  "successRate": "94.23%",
  "lastUpdated": "2025-12-26T01:23:45Z"
}
```

### Verify Script Integrity

Detect if any scripts have been modified:

```bash
zac-verify-scripts
```

Output:
```
🔍 Verifying script integrity...
  ✓ deploy.sh
  ✓ backup.sh
  ✗ suspicious-script.sh (MODIFIED!)
  ✓ migration.py
```

### Export Full Registry

```bash
node scripts/registry-manager.ts export > registry-backup.json
```

---

## Hospital-Grade Features

### 1. Integrity Verification

Every script has a SHA-256 checksum. The system detects modifications:

```json
{
  "integrity": {
    "algorithm": "sha256",
    "checksum": "a7f3d2e1c9b4f5a8e2d4f6b8a9c1d3e5...",
    "verified": true
  }
}
```

### 2. Execution Audit Trail

Every execution is logged with:
- **Timestamp** (UTC): When the script ran
- **Exit Code**: Success (0) or failure (non-zero)
- **Execution Count**: How many times this script ran
- **Status**: success | failed | unknown

### 3. Automatic Recovery

Scripts stored in `scripts/detected/` can be replayed for:
- Automated recovery procedures
- Disaster recovery scenarios
- Root cause analysis

### 4. Self-Diagnostics

The registry provides:
- Success rate per script
- Execution frequency analysis
- Error pattern detection
- Performance metrics

### 5. Threat Detection

Monitor for:
- Unusual script execution patterns
- Unexpected binary execution
- Privilege escalation attempts
- Unauthorized script modifications

---

## Advanced: Custom Metadata

To add rich metadata to your scripts, create them in `scripts/source/`:

```bash
# Create your script
cat > scripts/source/backup.sh << 'EOF'
#!/bin/bash
# Backup critical system data
set -euo pipefail

echo "Backing up database..."
pg_dump mydb | gzip > backup-$(date +%Y%m%d).sql.gz
EOF

chmod +x scripts/source/backup.sh
```

Register with metadata:

```typescript
const registry = new ScriptRegistry();
registry.registerSource('scripts/source/backup.sh', {
  purpose: 'Daily database backup',
  criticality: 'high',
  tags: ['database', 'backup', 'critical'],
  author: 'DevOps Team'
});
registry.save();
```

---

## Integration Examples

### Kubernetes / Container Orchestration

Log all kubectl commands:

```bash
kubectl apply -f config.yaml
# Auto-detected and registered
```

### Terraform / IaC

Track all infrastructure changes:

```bash
terraform plan
terraform apply
# Both automatically logged
```

### CI/CD Pipelines

Every pipeline step becomes an entry:

```yaml
# .github/workflows/deploy.yml
- name: Deploy
  run: bash scripts/deploy.sh
  # ✓ Auto-registered in registry
```

### Self-Healing Systems

Trigger automated recovery:

```bash
# If health check fails, replay recovery script
if ! health-check; then
  bash scripts/detected/recovery-proc-HASH.sh
fi
```

---

## Troubleshooting

### Auto-Detection Not Working?

1. **Verify shell initialization:**
   ```bash
   echo $ZAC_AI_ROOT
   # Should print: /workspaces/ZacAi-System-Core
   ```

2. **Check if source activated:**
   ```bash
   grep "shell-init.sh" ~/.bashrc
   ```

3. **Reload shell:**
   ```bash
   source ~/.bashrc
   ```

### Registry File Corruption?

```bash
# Restore from backup
cp registry-backup.json scripts/registry.json
```

### Modify Detected Scripts?

1. **Create new source script** with corrected version
2. **Register explicitly:**
   ```bash
   node scripts/registry-manager.ts register scripts/source/corrected.sh
   ```
3. **Delete from detected** if it's no longer used

---

## Performance Impact

- **Negligible**: ~2-5ms per command (async in background)
- **Storage**: ~1KB per unique script
- **CPU**: Minimal (hash computation is very fast)

---

## Security Considerations

1. **Registry is readable** - Anyone can see script history
2. **SHA-256 is strong** - Can't reverse-engineer from hash
3. **Detected scripts are executable** - Stored with hash in filename
4. **Integrity verified** - Detect unauthorized modifications

For sensitive scripts:
- Store in `scripts/source/` with restricted permissions
- Mark with criticality level: "critical"
- Use encryption for registry backups

---

## Next Steps

1. **Enable initialization:** Add to `~/.bashrc`
2. **Run scripts normally** - Auto-detection is transparent
3. **Monitor stats:** `zac-script-stats`
4. **Verify integrity:** `zac-verify-scripts` periodically

---

## Support

For questions about this system, refer to:
- [SECURITY.md](../SECURITY.md)
- [OPERATIONS.md](../OPERATIONS.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md)
