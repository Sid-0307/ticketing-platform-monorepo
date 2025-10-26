FROM node:18-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
RUN pnpm install --frozen-lockfile

FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY apps/web/.next ./apps/web/.next
COPY apps/web/public ./apps/web/public
COPY apps/web/package.json ./apps/web/
COPY package.json pnpm-workspace.yaml ./

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

WORKDIR /app/apps/web
CMD ["pnpm", "next", "start"]