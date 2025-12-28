FROM node:18-bullseye-slim
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY ./.npmrc ./ || true
RUN apt-get update && apt-get install -y ca-certificates curl && rm -rf /var/lib/apt/lists/*
COPY . .
RUN npm install -g pnpm@8.0.0
RUN pnpm install --frozen-lockfile --offline || pnpm install --reporter=silent
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "apps/web/server.js"]
