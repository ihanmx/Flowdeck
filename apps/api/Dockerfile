# syntax=docker/dockerfile:1
# this syntax tells Docker to use the latest Dockerfile features, like multi-stage builds and caching
 
# ---------- base: pnpm on a small Node image ----------
FROM node:22-alpine AS base
    # env variables for pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Install pnpm globally
RUN corepack enable
WORKDIR /app

# start new stage for building the app
FROM base AS build
# Copy only manifests first so Docker can cache the install layer
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

# Now copy the API source and build it
COPY apps/api ./apps/api
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

# Produce a self-contained, production-only bundle of the api package 
# Its files (including the compiled dist/),
# a real node_modules with only production deps (--prod drops dev deps like TypeScript, ESLint, testing tools),
RUN pnpm --filter api deploy --prod --legacy /prod/api


# brandnew stage for the final image, only what's needed to run the app
# ---------- runner: tiny final image, only what's needed to run ----------
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
# /prod/api has dist + package.json + prod-only node_modules (no dev tools, no source)
COPY --from=build /prod/api ./
EXPOSE 3001
CMD ["node", "dist/src/main.js"]