# Base image

FROM node:16.17.0-slim AS base

RUN apt-get update && apt-get install --no-install-recommends --yes openssl
RUN corepack enable

WORKDIR /app

# Builder image

FROM base AS builder

COPY package.json tsconfig.json yarn.lock ./
COPY .yarn ./.yarn
RUN yarn install --immutable --immutable-cache

COPY . ./

RUN yarn build

# Runner image

FROM base AS runner

COPY package.json yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD [ "node", "dist/index.js" ]

