FROM node:16.7.0-slim AS base

RUN apt-get update && apt-get install --no-install-recommends --yes openssl
RUN corepack enable

WORKDIR /app

# Builder image

FROM base AS builder

COPY package.json tsconfig.json yarn.lock ./
RUN yarn install --immutable --immutable-cache

RUN yarn build

