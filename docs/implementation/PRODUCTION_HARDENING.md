# Production Hardening (Phase 8) — Initial Plan

This document outlines initial production-hardening tasks to prepare ZacAi System Core for large-scale deployments.

## Goals
- High availability and failover
- Load testing and performance tuning
- Security hardening and secret management
- Observability and alerting integration

## Initial Tasks
1. Load testing scaffold
   - Add a script under `scripts/load-test.sh` using `hey` or `wrk` to simulate traffic.
2. Rolling upgrades
   - Build procedures for zero-downtime rollout (Canary / Blue-Green).
3. Failover and backups
   - Define backup/restore for audit store; implement snapshot script for WASM artifacts.
4. Secrets & certs
   - Integrate with Vault or environment-based secret management.
5. Monitoring
   - Add Prometheus metrics and Grafana dashboards (export p95/p99, error rates, compliance events).
6. CI gating
   - Add heavy-load tests to a separate workflow that runs on-demand.

## Next Steps
- Implement `scripts/load-test.sh` and add example Prometheus exporter.
- Plan failover runbook and automate snapshotting of audit logs.

