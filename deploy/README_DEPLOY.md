# Deployment Notes

This directory contains templates and examples to deploy ZacAi System Core in production.

Recommendations:

- Run behind a reverse proxy (NGINX) with TLS termination.
- Use a process manager (systemd shown, or pm2) to run `apps/web/server.js`.
- Store secrets using a secrets manager (Vault, AWS Secrets Manager) and inject via environment variables.
- Use container orchestration (Kubernetes) for multi-node/high-availability deployments.
- Enable monitoring and log shipping (Prometheus + Loki / ELK) to collect `logs/*.log` files.

Simple Docker build (example):
```bash
docker build -t zacai-system-core:latest -f deploy/Dockerfile .
docker run -p 3000:3000 --env ADMIN_TOKEN=your-secret --env OPENAI_API_KEY=xxx zacai-system-core:latest
```

Systemd example (install to `/etc/systemd/system/zacai.service`):
```bash
sudo cp deploy/zacai.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now zacai.service
```
