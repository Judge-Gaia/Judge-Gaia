FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @judge-gaia/shared build
RUN pnpm --filter @judge-gaia/server build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/apps/server/package.json apps/server/package.json
COPY --from=build /app/packages/shared/package.json packages/shared/package.json
COPY --from=build /app/apps/server/dist apps/server/dist
COPY --from=build /app/packages/shared/dist packages/shared/dist
RUN pnpm install --prod --frozen-lockfile
CMD ["pnpm", "--filter", "@judge-gaia/server", "start"]
